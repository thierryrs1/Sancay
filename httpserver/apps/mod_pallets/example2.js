//  # -*- coding: utf-8 -*-
// Author: José David Guillén <jdg@boyum-it.com>
// 2020-05-28	JDG
//SM::04/01/2022 - lines:  282, 439, 955, 1061, 1093, 1112, 1331
	
class app_qc_sample {
	constructor() {
		this.attachmentsViewer = new attachments('iHAttachments',null, this.attachments_upload);

		this.types = {
			'W':_t('Goods receipt'),
			'E':_t('Manufacturing'),
			'R':_t('Sales return'),
			'C':_t('Expiration date exceeded'),
			'T':_t('Stock Transfer'),
			'M':_t('Book manually'),
			'X':_t('Incoming invoice'),
			'Y':_t('Purchase return'),
			'Z':_t('Incoming credit'),
			'O':_t('Outgoing credit'),
			'P':_t('Delivery'),
			'Q':_t('Outgoing invoice'),
			'S':_t('Cancellation'),
			'p':_t('Cancellation'),
			'A':_t('Split batch'),
			'D':_t('Batch transfer posting'),
			'U':_t('Manual'),
			'F':_t('Work Order')
		};

		this.cache_blockReason = null;
		this.cache_valuation = null;

		this.controls = ['*',''];
		this.tabSamples_di_controls = ['*','sRelease1','sBlockageReasonId','sBlockageReasonText','sValuationId','sValuationText'];
		this.tabTests_di_controls = ['*','tValue','tMeasurementOK','tBlockageReasonId','tBlockageReasonText','tValuationId','tValuationText'];
		this.appData_clear();

		// PreCache block reasons for further operations (We need to create the GUI, option 2: sent with the html) 
		this.loadBlockReason().then((res)=>{ 
			this.loadValuations().then((res)=>{  

				this.gui();
				document.getElementsByName('QCOrder')[0].focus();
				
				this.batchesAdvancedEditor = new itemBatchInfo( 'in', [] );
				this.serialsAdvancedEditor = new itemSerialInfo( 'in', [] );

			});
		 });
		  
		//SM::31/01/2022 - TFS::68936 - Hide the "Save button" in the QC by sample app
		ux.set('appSave','hide');
/*		

		window.onbeforeunload = function(e) {
			if ( this.currentSample.modified || !this.checksample() )
				e.returnValue = _t("Are you sure you wish to close the app?");
		}.bind(this);
*/		
	}
	// ........................................................................................................................................................................................................................
	appData_clear() {

		this.QCOrder = null;
		this.currentSample = -1;
		this.currentTest = -1;
		if (ux.getElement('hQCInfo')) {
			ux.getElement('hQCInfo').innerHTML = '';
		}
	}
	// ........................................................................................................................................................................................................................
	newQCOrder() {
		return { 
			docEntry:0,
			docOrder:'',
			docDate:'',
			itemCode:'',
			itemName:'',
			iVersionId:'',

			description:'',
			qty:0,
			qty_uom:'',
			qty_uom_dec:6,
			qty_open:0,
			qty_ok:0,
			qty_nok:0,

			type:'',
			baseType:'',
			baseDocOrder:'',

			wo_id:0,
			wo_pos_id:0,
			wo_bom_id:0,

			samples:null
	   };
	}
	// ........................................................................................................................................................................................................................
	newSample() {
		return {
			LineNumber: 0,
			BlockageReasonId: null,
			BlockageReasonText: null,
			DistNumber: "",
			LastChangeDate: "",
			MeasurementFaulty: 0,
			MeasurementToRelease: 0,
			MeasurementUntested: 2,
			Release1: "O",
			Release2: null,
			ValuationId: null,
			ValuationText: null,
			QCPickList:'',

			_changed: false,
			tests:null
		};
	}
	// ........................................................................................................................................................................................................................
	newTest() {
		return {

		};
	}
	// ........................................................................................................................................................................................................................
	gui() {
		// Create the APP UI Template___________________________________________________________________
		var html = ui.tabs( "MApp", 
							[	
								{icon:ui.fa("cogs"), title:_t("QC Order"), active:true, content:this.tabQCOrder_ui(), id:"tabHeader"},
								{icon:ui.fa("cubes"), title:_t("Samples"), content:this.tabSamples_gui(), id:"tabSamples"},
								{icon:ui.fa("cube"), title:_t("Tests"), content:this.tabTests_gui(), id:"tabTests"}
							]
						);
		document.getElementById("app-container").innerHTML = 	html;
	
		// Apply the UX _____________________________________________________________________________
		ux.tabs('MApp', 'init');
		ux.listen('changing', 'MApp', 	function (e) { 
											switch(e.detail.targetTab) {
												case "tabHeader":	break;
												case "tabSamples":	if ( this.QCOrder==null ) e.preventDefault(); break;
												case "tabTests":	if ( this.currentSample<0 ) e.preventDefault(); break;
											}
									}.bind(this)
							);
		ux.listen('change', 'MApp', 	function (e) { 
											switch(e.detail.targetTab) {
												case "tabHeader":	
																	document.getElementsByName("QCOrder")[0].focus(); 
																	this.displayHeader();
																	break;
												case "tabSamples":	
																	// ToDo: uncomment next line to destroy cache and force to reload all as it's decribed in document
																	/* :( */ this.QCOrder.samples = null;
																	document.getElementsByName("qcSamplesFilter")[0].focus(); 
																	this.tabSamples_dgFilter();
																	break;
												case "tabTests":	
																	document.getElementsByName("qcTestFilter")[0].focus(); 
																	this.tabTests_dgFilter();
																	break;
											}
									}.bind(this)
							);							
		// ........................................................................................					
		this.tabQCOrder_ux();
		this.tabSamples_ux();
		this.tabTests_ux();


		// Automatic jump to next field if ENTER is pressed
		let inputAddEdit = function(e) { 
				if (e.code == 'Enter' || e.code == 'NumpadEnter') {
					switch(ux.tabs('MApp')) {
						case 'TabSamples': ux.focus(this.tabSamples_di_controls, e.target.name); break;
						case 'TabTests': ux.focus(this.tabTests_di_controls, e.target.name); break;
					}
				}
			}.bind(this);
		let textInputs = document.querySelectorAll('input[type=text]');
		for(let i = 0; i < textInputs.length; i++) textInputs[i].addEventListener('keyup', inputAddEdit);

		// Save all data
		ux.listen('click', "appSave", function (e) { this.saveAll(); }.bind(this) );
		ux.set('appSave','disabled');
	}
	// ........................................................................................................................................................................................................................
	async loadBlockReason() {
		if ( this.cache_blockReason == null ) {
			console.log("JDG :: Loading block reasons");
			ux.aget(  '/odata4/v1/QCBlockReason?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID+'&$format=jsonarray'
					+'&$select=BlockReasonId,BlockReasonText,inOrder,inSample,inMeasuring,BlockRelease'
				,function(err, result) { 
					console.log("JDG :: Loaded block reasons",result);
					if (!err && result.hasOwnProperty("value") && result.value.length>0) {
						this.cache_blockReason = result.value;
					} else {
						this.cache_blockReason = [];
					}
					
				}.bind(this)
			);
			await ux.wait(); 
			return await Promise.resolve(false);
		}
		return await Promise.resolve(true);
	}
	// ........................................................................................................................................................................................................................
	async loadValuations() {
		if ( this.cache_valuation == null ) {
			console.log("JDG :: Loading valuations");
			ux.wait(10);
			ux.aget(  '/odata4/v1/QCValidation?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID+'&$format=jsonarray'
					+'&$select=ValuationId,ValuationText,inOrder,inSample,inMeasuring'
					, function(err, result) { 
						console.log("JDG :: Loaded valuations",result);
						if (!err && result.hasOwnProperty("value") && result.value.length>0) {
							this.cache_valuation = result.value;
						} else {
							this.cache_valuation = [];
						}
					}.bind(this)
			);
			await ux.wait(); 
			return await Promise.resolve(false);
		}
		return await Promise.resolve(true);
	}
	// ........................................................................................................................................................................................................................





  	//	_____     _     ___   ___ ___         _         
	// |_   _|_ _| |__ / _ \ / __/ _ \ _ _ __| |___ _ _ 
	//   | |/ _` | '_ \ (_) | (_| (_) | '_/ _` / -_) '_|
	//   |_|\__,_|_.__/\__\_\\___\___/|_| \__,_\___|_|  
	// ........................................................................................................................................................................................................................
	tabQCOrder_ui() {
		return	ui.input( _t("QC Order"), "QCOrder", "", {licon:"fa-barcode",rbutton:"fa-search", autofocus:true} )
				+'<br>'
				+ui.box( '', {id:'hQCInfo'});
	}
	// ........................................................................................................................................................................................................................
	tabQCOrder_ux() {
		ux.autocomplete('QCOrder', '/odata4/v1/QCOrder?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID+'&$format=jsonarray&$inlinecount=allpages&$top=10&$skip=0&$orderby=DocOrder&$select=DocOrder,ItemCode&$filter=Closed eq false and (DocOrder like "*q*")',
						{ ondraw: function(d) { return d[0]+' '+d[1]; } }
					);
		ux.listen('change', "QCOrder", function (e) { this.setQCOrder(document.getElementsByName("QCOrder")[0].value); }.bind(this) );
		ux.click("QCOrder-rbutton",	function() {
								let s = new extendedSearch(
									{	
										id:'QCOrderSearch', 
										title:_t('QC Order Search'), 
										url: '/odata4/v1/QCOrder?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID+'&$format=jsonarray&$inlinecount=allpages&$top=10&$skip=0&$orderby=DocOrder&$select=DocOrder,DocDate,ItemCode,ItemName&$filter=Closed eq false and (DocOrder like "*q*" or ItemCode like "*q*" or "ItemName" like "*q*")',
										fields:[{title:_t("Doc Order"), sort_key:'DocOrder'},
												{title:_t("Date"), sort_key:'DocDate', hidden:'M',ondraw:function (v,col,dr) { return ux.jsonDateTime2local(v);}},
												{title:_t("Item No"), sort_key:'ItemCode'},
												{title:_t("ItemName"), sort_key:'ItemName', hidden:'M'}
											],
											sort_key:'DocDate',
											sort_dir:'desc'
									}
								);
								s.search( function() { if (s.selected_row != null ) this.setQCOrder(s.selected_row[0]); }.bind(this) );
					}.bind(this)
				);
	}
	// ........................................................................................................................................................................................................................
	setQCOrder( q ) {
		if ( document.getElementsByName("QCOrder")[0].getAttribute("autocomplete-active") == 'true' ) return;

		this.QCOrder 				= null;
		this.currentSample 			= -1;
		this.currentTest 			= -1;

		// todo (open / ok / error)
		console.log("JDG :: Loading information about QC Order("+q+")");
		ux.aget( '/odata4/v1/QCOrder?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID
					+'&select=DocEntry,DocOrder,DocDate,ItemCode,ItemName,IVersionId,Quantity,UoMStock,SamplesOpen,SamplesOK,SamplesError,MaterialTransfer,Type,BaseType,BaseDocOrder,WoDocEntry,WoLineNumber,WoLineNumber2,UoM/RoundDec,Item/ManageBatchNumbers,Item/ManageSerialNumbers'
					+'&$filter=Closed eq false and DocOrder eq '+ux.encodeODataString(q)+''
					,function(err, result) {
						let html = '';
						this.appData_clear();
						console.log("JDG :: Loaded information about QC Order("+q+")",result);
						if ( result.hasOwnProperty('value') && result.value.length>0 ) {
							let r =result.value[0];

							this.QCOrder = this.newQCOrder();
							this.QCOrder.DocEntry 		= r.DocEntry;
							this.QCOrder.DocOrder		= r.DocOrder;
							this.QCOrder.docDate		= r.DocDate;
							this.QCOrder.itemCode 		= r.ItemCode;
							this.QCOrder.itemName	 	= r.ItemName;
							this.QCOrder.qty 			= r.Quantity;
							this.QCOrder.qty_uom 		= r.UoMStock;
							this.QCOrder.qty_uom_dec 	= r.RoundDec;

							this.QCOrder.isBatch		= r.ManageBatchNumbers;
							this.QCOrder.isSerial		= r.ManageSerialNumbers;

							this.QCOrder.qty_open 		= r.SamplesOpen;
							this.QCOrder.qty_ok 		= r.SamplesOK;
							this.QCOrder.qty_nok 		= r.SamplesError;
							this.QCOrder.MaterialTransfer = r.MaterialTransfer;

							this.QCOrder.type 			= r.Type;
							this.QCOrder.baseType 		= r.BaseType;
							this.QCOrder.baseDocOrder 	= r.BaseDocOrder;

							this.QCOrder.wo_id 			= r.WoDocEntry;
							this.QCOrder.wo_pos_id 		= r.WoLineNumber;
							this.QCOrder.wo_bom_id	 	= r.WoLineNumber2;
						}
						ux.tabs("MApp",'active','tabSamples');
					}.bind(this)
				);
	}

	// ........................................................................................................................................................................................................................
	getType(t) {
		if (this.types.hasOwnProperty(t)) return this.types[t];
		return '';
	}
	// ........................................................................................................................................................................................................................
	displayHeader() {
		let html = '';
		if (this.QCOrder!=null) {
			html = ui.box(
					'<table style="width:100%">'
					+'<tr><th>'+_t('QC Order')+': <td>'+this.QCOrder.DocOrder + ' - '+ux.jsonDate2local(this.QCOrder.docDate)
					+'<tr><th>'+_t('Item No')+': <td>'+this.QCOrder.itemCode
					+'<tr><th>'+_t('Description')+': <td>'+this.QCOrder.itemName
					+'<tr><th>'+_t('Quantity')+': <td>'+ux.formatNumber( this.QCOrder.qty, this.QCOrder.qty_uom_dec )+' '+this.QCOrder.qty_uom 
					+'</table>'
					+'<hr>'
					+'<table style="width:100%">'
					+'<tr><th style="width:33%">'+_t('Open')
						+'<th style="width:33%">'+_t('Ok')
						+'<th style="width:33%">'+_t('Error')
					+'<tr><td class="C">'+ux.formatNumber( this.QCOrder.qty_open, this.QCOrder.qty_uom_dec )
						+'<td class="C">'+ux.formatNumber( this.QCOrder.qty_ok, this.QCOrder.qty_uom_dec )
						+'<td class="C">'+ux.formatNumber( this.QCOrder.qty_nok, this.QCOrder.qty_uom_dec )
					+'</table>'
					+'<hr>'
					+'<table style="width:100%">'
					+'<tr><th>'+_t('Type')+': <td>'+this.getType(this.QCOrder.type)
					+(this.QCOrder.baseDocOrder!=''?('<tr><th>'+_t('DocNumber')+': <td>'+this.QCOrder.baseDocOrder):'')
					+(this.QCOrder.wo_id>0?('<tr><th>'+_t('WO')+': <td>'+this.QCOrder.wo_id+'/'+this.QCOrder.wo_pos_id+'/'+this.QCOrder.wo_bom_id):'')
					+'</table>'
					);

			html += this.attachmentsViewer.getButtons();

			if (this.QCOrder.isBatch)
				html+= 	ui.button('qcBatchSerial',_t('View Batches'),{type:'is-fullwidth is-link',link:'javascript:app.tabQCOrder_batchesSerials()'});
/*				
			else
			if (this.QCOrder.isSerial)
				html+= 	ui.button('qcBatchSerial',_t('View Serials'),{type:'is-fullwidth is-link',link:'javascript:app.tabQCOrder_batchesSerials()'});
*/
			if(this.QCOrder.MaterialTransfer > 0) 
				html+= 	'&nbsp;'+ui.button('qcTransfer',_t('Transfer'),{type:'is-fullwidth is-link',link:'?program_id='+appInfo.gid+'&page=t20_qc_transfer&DocOrder='+encodeURIComponent(this.QCOrder.DocOrder)});

				
		} else 
		if ( document.getElementsByName("QCOrder")[0].value != '' ) {
			html = ui.message(-1, ui.fa('exclamation-triangle')+' '+_t('This QC order does not exist or it is closed'));
		}

		document.getElementById('hQCInfo').innerHTML = html;
		document.getElementsByName("QCOrder")[0].focus();

		this.attachmentsViewer.run();
	}
	// ........................................................................................................................................................................................................................
	tabQCOrder_batchesSerials() {
		console.log('JDG :: Loading batches/serial for QC('+this.QCOrder.DocEntry+')');
		ux.dialog(	 (this.QCOrder.isBatch?_t('Batches'):_t('Serials'))
					,ui.dgrid('dgBatchSerial')
					,{  id:'dgl_batchSerial'
						,buttons:[
									{id:'close', title:_t("Close"),type:"is-link"}
								] 
					}
					,function(b){
						// nothing
					}.bind(this)
				);

		ux.dgrid('dgBatchSerial', { 	
									fields:[
											{title:_t('Status'), sort_key:'VisualOrder', align:'center'},
											{title:(this.QCOrder.isBatch?_t('Batches'):_t('Serials'))}
										],
									url:'/odata4/v1/QCOrder/QCOrderBatches('+this.QCOrder.DocEntry+')',
									sort_key:'Batch', sort_dir:'ASC',
									ondraw_row:function(tbody, rid, dr){
											let row, cell, i;
	
											row = tbody.insertRow(-1);
											row.setAttribute('data-rid',rid);
											row.onclick = function(e) { app.dgBatchSerial_onclick_row(dr, rid, e); };
											i=0;
											cell = row.insertCell(i++); 		// Status
											cell.className = 'C';
											cell.innerHTML = app.dgBatchSerial_getBatchStatus(dr.Status);

											cell = row.insertCell(i++); 		// Batch
											cell.style='text-align:right;padding-right: 4px;';
											cell.innerHTML = dr.Batch;
									}
								}
		);
	}
	// ....................................................................................................................................................................................................................
	dgBatchSerial_getBatchStatus(v) {
		switch(+v) {
			case 0: /* Accesible */ 
				v = '<span class="has-text-success">'+ui.fa('check-circle')+'</span>';
				break;
			case 1: /* Not Accesible */
				v = '<span class="has-text-danger">'+ui.fa('times')+'</span>';
				break;
			case 2: /* Locked */
				v = '<span class="has-text-danger">'+ui.fa('times-circle')+'</span>';
				break;
		}
		return v;
	}
	// ....................................................................................................................................................................................................................
	dgBatchSerial_onclick_row(d,rid,e) {
		console.log("JDG :: Row clicked > ",d);

		let bs;
		if (d.Status==0) bs=1; else bs=0;
		console.log('Change Batch status from '+d.Status+' to '+bs);
		ux.saveAll(	'/odata4/v1/BatchNumber('+ux.encodeODataString(d.ItemCode)+','+encodeURIComponent(d.SystemNumber)+')' //?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID
								, {Status:bs}
								, function(err, result) {
										if (!err){ 
											console.log('Changed Batch status from '+d.Status+' to '+bs, result);
											d.Status=bs;
											document.getElementById('dg-dgBatchSerial').rows[1+(+rid)].cells[0].innerHTML = this.dgBatchSerial_getBatchStatus(bs);
										} else {
											console.log('Error changing Batch status from '+d.Status+' to '+bs, result);
										}
									}.bind(this)
								, {method:'PUT',contentType:'json',timeout:180000}
							);		
	}



	//  _____     _    ___                  _        
	// |_   _|_ _| |__/ __| __ _ _ __  _ __| |___ ___
	//   | |/ _` | '_ \__ \/ _` | '  \| '_ \ / -_|_-<
	//   |_|\__,_|_.__/___/\__,_|_|_|_| .__/_\___/__/
	// ...............................|_|.......................................................................................................................................................................................
	tabSamples_gui() {
		return '<div id="tabSamples-dg">'
					+this.tabSamples_dg_gui()
				+'</div>'
				+'<div id="tabSamples-di" style="display:none">'
					+this.tabSamples_di_gui()
				+'</div>';
	}
	// ........................................................................................................................................................................................................................
	tabSamples_ux() {
		this.tabSamples_dg_ux();
		this.tabSamples_di_ux();
	}


	//  _____     _    ___                  _                ___   ___ 
	// |_   _|_ _| |__/ __| __ _ _ __  _ __| |___ ___  ___  |   \ / __|
	//   | |/ _` | '_ \__ \/ _` | '  \| '_ \ / -_|_-< |___| | |) | (_ |
	//   |_|\__,_|_.__/___/\__,_|_|_|_| .__/_\___/__/       |___/ \___|
	// ...............................|_|.........................................................................................................................................................................................
	tabSamples_dg_gui() {
		return  ui.input( _t("Filter"), "qcSamplesFilter", "", {licon:"fa-cube",rbutton:"fa-search", autofocus:true} ) 
				+ui.dgrid("dgSamples")
				+ui.button('tabSamples_dg_newSample',_t('Add New Sample'), {type:'is-fullwidth',link:'javascript:app.tabSamples_dg_newSample();',licon:'plus-circle'});
	}	
	// ........................................................................................................................................................................................................................
	tabSamples_dg_ux() {
		ux.listen('click', "qcSamplesFilter-rbutton", function(e){ 
																if ( this.tabSamples_dgFilter(document.getElementsByName("qcSamplesFilter")[0].value) == 1 ) {
																	ux.tabs("MApp",'active','tabTests');
																}
															 }.bind(this) );
		ux.listen('keyup', "qcSamplesFilter", function(e){ if (e.keyCode == 13) this.tabSamples_dgFilter(document.getElementsByName("qcSamplesFilter")[0].value); }.bind(this) );

		ux.dgrid('dgSamples', { 	fields:[
													{title:_t('...'), align:'center' },
													{title:_t('Sample'), sort_key:'LineNumber', sort_type:'number', align:'right'},
													{title:_t('Untested'), sort_key:'MeasurementUntested', align:'right'},
													{title:_t('Faulty'), sort_key:'MeasurementFaulty', align:'right', hidden:'M'},
													{title:_t('To Release'), sort_key:'MeasurementToRelease', align:'right', hidden:'M'},
													{title:_t('DistNumber'), sort_key:'DistNumber'},
													{title:_t("Last Change"), sort_key:'LastChangeDate', align:'center',hidden:'M' }
												],
									url:'',
									rows:[],
									displayFilter:function(d) {
															return (   this.dgSamples_filter=='' 
																	|| +d.LineNumber == +this.dgSamples_filter		
																	|| d.DistNumber.toLowerCase().indexOf(this.dgSamples_filter)>=0
																   );
														}.bind(this),
									sort_key:'LineNumber', sort_dir:'ASC',
									ondraw_row:function(tbody, rid, dr){
											let row, cell, i;
	
											row = tbody.insertRow(-1);
											row.setAttribute('data-rid',rid);
											row.onclick = function(e) { 
																if ( e.target.tagName == 'TD' ) {
																	let rid = e.target.parentNode.getAttribute("data-rid");
																	let dr = ux.dgrid('dgSamples').rows.value[rid];
																	app.dgSamples_onclick_row(dr, rid, e);
																}
														};
											i=0;
											cell = row.insertCell(i++); 		// ...
											cell.className = 'C';
											cell.innerHTML = '...';

											cell = row.insertCell(i++); 		// Sample
											cell.style='text-align:right;padding-right: 4px;';
											cell.innerHTML = dr.LineNumber;

											cell = row.insertCell(i++); 		// Untested
											cell.style='text-align:right;padding-right: 4px;';
											cell.innerHTML = dr.MeasurementUntested;

											if ( !ux.useMinimalistUI ) {
												cell = row.insertCell(i++); 	// Faulty
												cell.style='text-align:right;padding-right: 4px;';
												cell.innerHTML = dr.MeasurementFaulty;

												cell = row.insertCell(i++); 	// To Release
												cell.style='text-align:right;padding-right: 4px;';
												cell.innerHTML = dr.MeasurementToRelease;
											}

											cell = row.insertCell(i++); 		// DistNumber
											cell.innerHTML = dr.DistNumber;

											if ( !ux.useMinimalistUI ) {
												cell = row.insertCell(i++); 	// LastChangeDate
												cell.innerHTML = ux.jsonDateTime2local(dr.LastChangeDate);
											}
										} 
									}
					);						
	}
	// ........................................................................................................................................................................................................................
	tabSamples_dgFilter(filter='') {
		document.getElementById('tabSamples-di').style.display='none';
		document.getElementById('tabSamples-dg').style.display='';

		if ( this.QCOrder.samples==null ) {
			console.log("JDG :: Loading samples for QC("+this.QCOrder.DocEntry+')');
			
			ux.aget( '/odata4/v1/QCOrderSamples?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID+'&$inlinecount=allpages'
					+'&$select=LineNumber as i,LineNumber,MeasurementUntested,MeasurementFaulty,MeasurementToRelease,DistNumber,LastChangeDate,Release1,Release2,ValuationId,ValuationText,BlockageReasonId,BlockageReasonText'
					+'&$filter=DocEntry eq '+encodeURIComponent(this.QCOrder.DocEntry)
					+' and (Release1 eq "O" or Release1 eq "R")'
					+'&$orderby=LineNumber'
					, function(err, result) {
						console.log("JDG :: Loaded samples for QC("+this.QCOrder.DocEntry+')',result);
						if (!err && result.hasOwnProperty("value")) {
							result.value.tests = null;
							this.QCOrder.samples = result.value;
							ux.dgrid('dgSamples').rows.value=this.QCOrder.samples;

							// Backend sort doesn't work for "LineNumber" because is a text field (do it in FrontEnd)
							ux.dgrid('dgSamples').sort_dir = 'desc';
							ux.dgrid('dgSamples').sort( 1 );

							this.tabSamples_dgFilter(filter);
						} else {
							this.QCOrder.samples = [];
						}
					}.bind(this)
			);
			return;
		}

		console.log("JDG :: Showing samples for QC("+this.QCOrder.DocEntry+") Filter("+filter+")");
		this.dgSamples_filter = filter;
		ux.dgrid('dgSamples').page(1);	
	}
	// ........................................................................................................................................................................................................................
	dgSamples_onclick_row(d,rid,e) {
		console.log("JDG :: Samples Row clicked > ",d);
		if ( e.target.tagName == 'TD' && e.target.cellIndex==0 ) {
			this.currentSample = rid;
			this.QCOrder.samples[this.currentSample]._changed=false;
			this.QCOrder.samples[this.currentSample]._org=JSON.parse(JSON.stringify(this.QCOrder.samples[this.currentSample]));
			this.tabSamples_di_display();
			
	
			ux.dialog(_t('Sample')+': '+this.QCOrder.samples[this.currentSample].LineNumber
					,'<div id="tabSamples-dlg-di"></div>'
					,{  id:'dgl_sample_info_save'
						,buttons:[
									{id:'cancel', title:_t("Cancel")},
									{id:'save', title:_t("Save"),type:"is-link"}
								] 
					}
					,function(b){
						if ( b=='save' ) {
							if ( this.tabSamples_di_check() ) return false;
							this.saveAll();
							return false;
						} else {
							this.QCOrder.samples[this.currentSample] = JSON.parse(JSON.stringify(this.QCOrder.samples[this.currentSample]._org));
						}
	
						document.getElementById('tabSamples-di').style.display='none';
						document.getElementById('tabSamples').appendChild( document.getElementById('tabSamples-di') );
	
						return true;
					}.bind(this)
				);
			document.getElementById('tabSamples-dlg-di').appendChild( document.getElementById('tabSamples-di') );
			document.getElementById('tabSamples-di').style.display='';					
		} else {
			this.currentSample = rid;
			ux.tabs("MApp",'active','tabTests');
		}
	}
	// ........................................................................................................................................................................................................................
	tabSamples_dg_newSample() {
		console.log('ToDo: Requesting a new sample... O('+this.QCOrder.DocEntry+')');
		ux.aget('/odata4/v1/QCOrder/CreateSample('+encodeURIComponent(this.QCOrder.DocEntry)+')?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID
				, function(err, result) {
					console.log('Requested sample', result);
					if (!err){ 
							let s = this.newSample();
							s.LineNumber = result.LineNumber;
							s.MeasurementFaulty = 0;
							s.MeasurementToRelease = 0;
							s.MeasurementUntested = 0;

							this.QCOrder.samples.push( s );
							let dg=ux.dgrid('dgSamples');
							dg.page(1);
					}
				}.bind(this)
//				, {method:'PUT',contentType:'json',timeout:180000}
			);		
	}



	//  _____     _    ___                  _                ___ ___ 
	// |_   _|_ _| |__/ __| __ _ _ __  _ __| |___ ___  ___  |   \_ _|
	//   | |/ _` | '_ \__ \/ _` | '  \| '_ \ / -_|_-< |___| | |) | | 
	//   |_|\__,_|_.__/___/\__,_|_|_|_| .__/_\___/__/       |___/___|
	// ...............................|_|...........................................................................................................................................................................................
	tabSamples_di_gui() {
		return 	ui.select( _t('Release 1'), 'sRelease1', '', [["A",_t('Automatic')], ["O",_t('Open')], ["E",_t('Locked')], ["F",_t('Released')], ["I",_t('Manually Locked')], ["R",_t('Manually Reopen')]] )
				+	ui.checkbox( _t('Release 2'), 'sRelease2', false )
				+	ui.select( _t('Blockage Reason'), 'sBlockageReasonId', '', this.cache_blockReason )
				+	ui.input( '', 'sBlockageReasonText','', {licon:"fa-info"})
				+	ui.select( _t('Valuation'), 'sValuationId', '', this.cache_valuation )
				+	ui.input( '', 'sValuationText','', {licon:"fa-info"});
	}	                            
	// ........................................................................................................................................................................................................................
	tabSamples_di_ux() {
		ux.listen('change', "sRelease1", function (e) { 
														this.QCOrder.samples[this.currentSample]._changed = true;
														this.QCOrder.samples[this.currentSample].Release1 = document.getElementsByName('sRelease1')[0].value;
														this.tabSamples_di_display();
													}.bind(this) 
				);

		ux.listen('change', "sRelease2", function (e) { 
														this.QCOrder.samples[this.currentSample]._changed = true;
														this.QCOrder.samples[this.currentSample].Release2 = document.getElementsByName('sRelease2')[0].checked;
														this.tabSamples_di_display();
													}.bind(this) 
				);

		ux.listen('change', "sBlockageReasonId", function (e) { 
														this.QCOrder.samples[this.currentSample]._changed = true;
														this.QCOrder.samples[this.currentSample].BlockageReasonId = document.getElementsByName('sBlockageReasonId')[0].value;
														this.tabSamples_di_display();
													}.bind(this) 
				);

		ux.listen('change', "sBlockageReasonText", function (e) { 
														this.QCOrder.samples[this.currentSample]._changed = true;
														this.QCOrder.samples[this.currentSample].BlockageReasonText = document.getElementsByName('sBlockageReasonText')[0].value;
														this.tabSamples_di_display();
													}.bind(this) 
				);

		ux.listen('change', "sValuationId", function (e) { 
														this.QCOrder.samples[this.currentSample]._changed = true;
														this.QCOrder.samples[this.currentSample].ValuationId = document.getElementsByName('sValuationId')[0].value;
														this.tabSamples_di_display();
													}.bind(this) 
				);

		ux.listen('change', "sValuationText", function (e) { 
														this.QCOrder.samples[this.currentSample]._changed = true;
														this.QCOrder.samples[this.currentSample].ValuationText = document.getElementsByName('sValuationText')[0].value;
														this.tabSamples_di_display();
													}.bind(this) 
				);		
	}	                            
	// ........................................................................................................................................................................................................................
	tabSamples_di_display() {
		document.getElementsByName("sRelease1")[0].value 			= this.QCOrder.samples[this.currentSample].Release1;
		document.getElementsByName("sRelease2")[0].checked 			= this.QCOrder.samples[this.currentSample].Release2;
		document.getElementsByName("sBlockageReasonId")[0].value 	= this.QCOrder.samples[this.currentSample].BlockageReasonId;
		document.getElementsByName("sBlockageReasonText")[0].value 	= this.QCOrder.samples[this.currentSample].BlockageReasonText;
		document.getElementsByName("sValuationId")[0].value 		= this.QCOrder.samples[this.currentSample].ValuationId;
		document.getElementsByName("sValuationText")[0].value 		= this.QCOrder.samples[this.currentSample].ValuationText;
		this.tabSamples_di_check();
	}
	// ........................................................................................................................................................................................................................
	tabSamples_di_check(f=null) {
		let hasError = false;
		ux.focus(this.controls, f||document.activeElement.name);

		let s = this.QCOrder.samples[this.currentSample];

		// - A, E, F, I => (disabled)  ( I, R => not allowed )
		ux.set("sRelease1","clear")
		if ( !s._changed ) {
			switch(s.Release1) {
				case 'A':
				case 'E':
				case 'F':
				case 'I':
					ux.set("sRelease1","disabled")
					break;
			}
		} else {
			switch(s.Release1) {
				case 'I':
				case 'R':
					hasError=true;
					ux.set("sRelease1","error")
					break;
			}
		}

		this.QCOrder.samples[this.currentSample]._errors = hasError;
		return hasError;
	}
	


	//  _____     _   _____       _      
	// |_   _|_ _| |_|_   _|__ __| |_ ___
	//   | |/ _` | '_ \| |/ -_|_-<  _(_-<
	//   |_|\__,_|_.__/|_|\___/__/\__/__/
	// ........................................................................................................................................................................................................................
	tabTests_gui() {
		return '<div id="tabTests-dg">'
					+this.tabTests_dg_gui()
				+'</div>'
				+'<div id="tabTests-di" style="display:none">'
					+this.tabTests_di_gui()
				+'</div>';
	}
	// ........................................................................................................................................................................................................................
	tabTests_ux() {
		this.tabTests_dg_ux();
		this.tabTests_di_ux();
	}


	//  _____     _   _____       _              ___   ___ 
	// |_   _|_ _| |_|_   _|__ __| |_ ___  ___  |   \ / __|
	//   | |/ _` | '_ \| |/ -_|_-<  _(_-< |___| | |) | (_ |
	//   |_|\__,_|_.__/|_|\___/__/\__/__/       |___/ \___|
	// ........................................................................................................................................................................................................................
	tabTests_dg_gui() {
		return 	ui.input( _t("Filter"), "qcTestFilter", "", {licon:"fa-cube",rbutton:"fa-search", autofocus:true} ) 
				+ui.dgrid("dgTest");
	}
	// ........................................................................................................................................................................................................................
	tabTests_dg_ux() {
		ux.listen('click', "qcTestFilter-rbutton", function(e){ 
																if ( this.tabTests_dgFilter(document.getElementsByName("qcTestFilter")[0].value) == 1 ) {
																	ux.tabs("MApp",'active','tabTests');
																}
		 													}.bind(this) );
		ux.listen('keyup', "qcTestFilter", function(e){ if (e.keyCode == 13) this.tabTests_dgFilter(document.getElementsByName("qcTestFilter")[0].value); }.bind(this) );

		ux.dgrid('dgTest', { 	
							fields:[
									{title:_t(''), 				align:'center',ondraw:function (v,col,dr) { return '?';} },
									{title:_t('PosId'), 		align:'right', hidden:true},
									{title:_t('Pos'),  			align:'right'},
									{title:_t('QC Order'), 		align:'left'},
									{title:_t('Minimum'), 		align:'right', hidden:'M'},
									{title:_t('Desired'), 		align:'right', hidden:'M'},
									{title:_t('Maximum'), 		align:'right', hidden:'M'},
									{title:_t('Measure'), 		align:'right'},
									{title:_t('UoM'), 			align:'left'},
									{title:_t('OK'), 			align:'center', hidden:'M'},
									{title:_t('Methodology'), 	align:'left', hidden:'M'}
								],
							url:'',
							rows:[],
							displayFilter:function(d) {
											return (   this.dgTest_filter=='' 
													|| d.QCDescription.toLowerCase().indexOf(this.dgTest_filter)>=0
													|| d.PosText.toLowerCase().indexOf(this.dgTest_filter)>=0		
												   );
										}.bind(this),
							sort_key:'Sort', sort_dir:'ASC',
							ondraw_row:function(tbody, rid, dr){
											let row, cell, i;
	
											row = tbody.insertRow(-1);
											row.setAttribute('data-rid',rid);
											row.onclick = function(e) { 
																if ( e.target.tagName == 'TD' ) {
																	if ( !ux.useMinimalistUI && (e.target.cellIndex==6 || e.target.cellIndex==8) ) return;

																	let rid = +e.target.parentNode.getAttribute("data-rid");
																	let dr = ux.dgrid('dgTest').rows.value[rid];
																	app.tabTests_dg_onclick_row(dr, rid, e);
																}
														};
															
//											row.className = 'has-text-weight-bold';

											i=0;
											cell = row.insertCell(i++); 		
											if (dr.Relevant) {
												switch(dr.Type) {
													case 'L': break;
													case 'T': break;
													//DevOps 70272 :: SM 28/02/2022 :: Added a validation for Measurementok and manual ok
													//default: dr.MeasurementOK=(+dr.MeasurementNumber>= +dr.Minimal && +dr.MeasurementNumber<= +dr.Maximum);
													default:
													if (!dr.MeasurementOKManual ) {
														dr.MeasurementOK=(+dr.MeasurementNumber>= +dr.Minimal && +dr.MeasurementNumber<= +dr.Maximum);
													}
												}
					
												if (dr.MeasurementOK) {
													cell.className = 'has-text-success C';
													// cell.innerHTML = 'O';
													cell.innerHTML = ui.fa('check-circle');
												} else {
													cell.className = 'has-text-danger C';
													// cell.innerHTML = 'X';
													cell.innerHTML = ui.fa('exclamation-triangle');
												}
											} else {
												cell.innerHTML = '';
											}

											cell = row.insertCell(i++); 		// Pos Text
											cell.style='text-align:right;padding-right: 4px;';
											cell.innerHTML = dr.PosText;

											cell = row.insertCell(i++); 		// QC Order
											cell.innerHTML = dr.QCDescription;

											if ( !ux.useMinimalistUI ) {
												cell = row.insertCell(i++); 	// Minimum
												cell.style='text-align:right;padding-right: 4px;';
												cell.innerHTML = (dr.Type=='L' || dr.Type=='T')?'':ux.formatNumber(dr.Minimal,dr.RoundDec||6);

												cell = row.insertCell(i++); 	// Desired value
												cell.style='text-align:right;padding-right: 4px;';
												cell.innerHTML = (dr.Type=='L' || dr.Type=='T')?'':ux.formatNumber(dr.DesiredValue,dr.RoundDec||6);

												cell = row.insertCell(i++); 	// Maximum
												cell.style='text-align:right;padding-right: 4px;';
												cell.innerHTML = (dr.Type=='L' || dr.Type=='T')?'':ux.formatNumber(dr.Maximum,dr.RoundDec||6);
											}

											cell = row.insertCell(i++); 		// Pos Text
											switch(dr.Type) {
												case 'L':
													cell.colSpan=2;
													if ( ux.useMinimalistUI )
														cell.innerHTML = dr.MeasurementString;
													else {
														let j,o,html='';
														html += '<select class="select" onchange="app.tabTests_dg_saveMeasurementString('+rid+',this)">'
																+'<option value=""></option>';
														o = (dr.QCPickList||'').split("\r\n");
														//SM::31/01/2022 - TFS 68936 - escape function does not belong in this 
														//for(j=0;j<o.length;j++) if(o[j]!="") html += '<option value="'+escape(o[j])+'"'+(o[j]==dr.MeasurementString?' selected':'')+'>'+escape(o[j])+'</option>';
														for(j=0;j<o.length;j++) if(o[j]!="") html += '<option value="'+o[j]+'"'+(o[j]==dr.MeasurementString?' selected':'')+'>'+o[j]+'</option>';
														html += '</select>';
														cell.innerHTML = html;
														// cell.innerHTML = '<input type="input" value="'+dr.MeasurementString+'" class="input" onchange="app.tabTests_dg_saveMeasurementString('+rid+',this)">';
													}
													break;
												case 'T':
													cell.colSpan=2;
													if ( ux.useMinimalistUI )
														cell.innerHTML = dr.MeasurementString;
													else
														cell.innerHTML = '<input type="input" value="'+dr.MeasurementString+'" class="input" onchange="app.tabTests_dg_saveMeasurementString('+rid+',this)">';
													break;
												case 'I':
												default:
													cell.style='text-align:right;padding-right: 4px;';
													if ( ux.useMinimalistUI )
														cell.innerHTML = ux.formatNumber(dr.MeasurementNumber,dr.RoundDec||6);
													else
														cell.innerHTML = '<input type="number" class="input R" value="'+(dr.MeasurementPersonellId?dr.MeasurementNumber:'')+'" onchange="app.tabTests_dg_saveMeasurementNumber('+rid+',this)">';

													cell = row.insertCell(i++); 		// UoMCode
													cell.innerHTML = dr.UoMCode;
													break;

											}
											

											if ( !ux.useMinimalistUI ) {
												cell = row.insertCell(i++); 	// MeasurementOK
												
												//DevOps :: 70272 :: SM 02/28/2022 - added MeasurementOKManual check
												let disabled = '';
												if (!dr.MeasurementOKManual ) {
													disabled = 'disabled';
												}
												
												switch(dr.Type) {
													case 'L':
														//SM::31/01/2022 - TFS 68936 - added checkbox name
														//cell.innerHTML = '<input type="checkbox" '+(dr.MeasurementOK?'checked':'')+' onchange="app.tabTests_dg_saveMeasurementOk('+rid+',this)">';
														cell.innerHTML = '<input type="checkbox" '+disabled+' '+(dr.MeasurementOK?'checked':'')+' name="S'+(app.currentSample)+'T'+rid+'_ok" onchange="app.tabTests_dg_saveMeasurementOk('+rid+',this)">';
														break;
													case 'T':
														cell.innerHTML = '';
														break;
													case 'I':
													default:
														cell.innerHTML = '<input type="checkbox" readonly '+disabled+' name="S'+(app.currentSample)+'T'+rid+'_ok" '+(dr.MeasurementOK?'checked':'')+'  onchange="app.tabTests_dg_saveMeasurementOk('+rid+',this)">';
														break;
												}

												cell = row.insertCell(i++); 	// Methodology
												cell.innerHTML = dr.QCInfo||'';
											}
										} 
									}
					);	
	}
	// ........................................................................................................................................................................................................................
	tabTests_dgFilter(filter='') {
		document.getElementById('tabTests-di').style.display='none';
		document.getElementById('tabTests-dg').style.display='';

		let sid = this.QCOrder.samples[this.currentSample].LineNumber;

		if ( this.QCOrder.samples[this.currentSample].tests==null ) {
			console.log("JDG :: Loading test for QC("+this.QCOrder.DocEntry+") Sample: "+sid);
			
			//DevpOps :: 70272 - SM :: 28/02/2022 - Added MeasurementOKManual field
			ux.aget( '/odata4/v1/QCOrderMeasurement?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID
					+'&$select=LineNumber2,PosText,Sort,QCDescription,QCInfo,Type,Minimal,Maximum,DesiredValue,MeasurementOK,MeasurementNumber,MeasurementString,ValuationId,ValuationText,BlockageReasonId,BlockageReasonText,Relevant,UoMCode,UoM/RoundDec,ResourceId,QCPickList,MeasurementPersonellId,MeasurementOKManual'
					+'&$filter=DocEntry eq '+encodeURIComponent(this.QCOrder.DocEntry)+' and LineNumber eq '+ux.encodeODataString(sid)+''
					+'&$orderby=Sort'
					, function(err, result) {
						console.log("JDG :: Loaded test for QC("+this.QCOrder.DocEntry+") Sample: "+sid,result);
						if (!err && result.hasOwnProperty("value")) {
							this.QCOrder.samples[this.currentSample].tests = result.value;
							ux.dgrid('dgTest').rows.value=this.QCOrder.samples[this.currentSample].tests;
							this.tabTests_dgFilter(filter);
						} else {
							this.QCOrder.samples[this.currentSample].tests=[];
						}
					}.bind(this)
			);
			return;
		}

		console.log("JDG :: Showing tests for QC("+this.QCOrder.DocEntry+") Sample: "+sid);
		this.dgTest_filter = filter;
		ux.dgrid('dgTest').page(1);		
	}
	// ........................................................................................................................................................................................................................
	tabTests_dg_onclick_row(d,rid) {
		console.log("JDG :: Test Row clicked > ",d);
		this.currentTest = rid;

		/*
		document.getElementById('tabTests-dg').style.display='none';
		document.getElementById('tabTests-di').style.display='';
		*/
		this.QCOrder.samples[this.currentSample].tests[this.currentTest]._changed=false;
		this.QCOrder.samples[this.currentSample].tests[this.currentTest]._org=JSON.parse(JSON.stringify(this.QCOrder.samples[this.currentSample].tests[this.currentTest]));
		// ux.set('tPosText','subtitle', this.QCOrder.samples[this.currentSample].tests[this.currentTest].PosText);
		ux.set('tQCOrder','subtitle', this.QCOrder.samples[this.currentSample].tests[this.currentTest].QCDescription);
		let t = this.QCOrder.samples[this.currentSample].tests[this.currentTest].ResourceId||'';
		document.getElementById('tInfo').innerHTML=(t!=''?(_t('Tool')+': '+t+'<br>'):'')
													+this.QCOrder.samples[this.currentSample].tests[this.currentTest].QCInfo;

		// Set the right control type
		switch(this.QCOrder.samples[this.currentSample].tests[this.currentTest].Type) {
			case 'L':
				let j,o,kv=[],html='';
				o = (this.QCOrder.samples[this.currentSample].tests[this.currentTest].QCPickList||'').split("\r\n");
				kv.push(['','']);
				for(j=0;j<o.length;j++) if(o[j]!="") kv.push([o[j],o[j]]);
				document.getElementById('QCValue_div').innerHTML = ui.select( _t('Value'), 'tValue','',kv, {licon:"fa-info"});
				break;
			case 'T':
				document.getElementById('QCValue_div').innerHTML = ui.input( _t('Value'), 'tValue','', {licon:"fa-info"});
				break;
			case 'I':
			default:				
				document.getElementById('QCValue_div').innerHTML = ui.input( _t('Value'), 'tValue','', {licon:"fa-info"});
				break;
		}													
		ux.listen('change', "tValue", function (e) { 
				this.QCOrder.samples[this.currentSample].tests[this.currentTest]._changed = true;
				switch(this.QCOrder.samples[this.currentSample].tests[this.currentTest].Type) {
					case 'L':
					case 'T':
						this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementString = document.getElementsByName('tValue')[0].value;
						break;
					case 'I':
					default:	
						this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementNumber = document.getElementsByName('tValue')[0].value;
						this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementOK = !(this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementNumber < this.QCOrder.samples[this.currentSample].tests[this.currentTest].Minimal || this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementNumber > this.QCOrder.samples[this.currentSample].tests[this.currentTest].Maximum )
						break;
				}
				this.tabTests_di_display();
			}.bind(this) 
		);
													
		this.tabTests_di_display();

		ux.dialog(_t('Test')+' | '+_t('Position')+': '+this.QCOrder.samples[this.currentSample].tests[this.currentTest].PosText
				,'<div id="tabTests-dlg-di"></div>'
				,{  id:'dgl_test_info_save'
					,buttons:[
								{id:'cancel', title:_t("Cancel")},
								{id:'save', title:_t("Save"),type:"is-link"}
							] 
				}
				,function(b){
					if ( b=='save' ) {
						if ( this.tabTests_di_check() ) return false;
						this.saveAll();
						return false;
					} else {
						this.QCOrder.samples[this.currentSample].tests[this.currentTest] = JSON.parse(JSON.stringify(this.QCOrder.samples[this.currentSample].tests[this.currentTest]._org));
					}

					document.getElementById('tabTests-di').style.display='none';
					document.getElementById('tabTests').appendChild( document.getElementById('tabTests-di') );

					return true;
				}.bind(this)
			);
		document.getElementById('tabTests-dlg-di').appendChild( document.getElementById('tabTests-di') );
		document.getElementById('tabTests-di').style.display='';		
	}
	// ........................................................................................................................................................................................................................
	tabTests_dg_saveMeasurementNumber(_test,f) {
		let _qcOrder = this.QCOrder.DocEntry;
		let _sample = this.currentSample;

		let mok = (+f.value>= +this.QCOrder.samples[_sample].tests[_test].Minimal && +f.value<= +this.QCOrder.samples[_sample].tests[_test].Maximum);
		console.log('ToDo: Save the data... O('+_qcOrder+') S('+this.QCOrder.samples[_sample].LineNumber+') T('+this.QCOrder.samples[_sample].tests[_test].LineNumber2+') = '+f.value);
		ux.saveAll(	'/odata4/v1/QCOrderMeasurement('+encodeURIComponent(this.QCOrder.DocEntry)+','+ux.encodeODataString(this.QCOrder.samples[_sample].LineNumber)+','+encodeURIComponent(this.QCOrder.samples[_sample].tests[_test].LineNumber2)+')' //?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID
								, {MeasurementNumber:+f.value, MeasurementOK:mok}
								, function(err, result) {
										if (!err){ 
											console.log('Saved the data... O('+_qcOrder+') S('+this.QCOrder.samples[_sample].LineNumber+') T('+this.QCOrder.samples[_sample].tests[_test].LineNumber2+') = '+f.value, result);
											if (mok) {
												ux.set(f,"clear");
												//JMC 24.04.2024 TFS97259 Check if this element exists. If flag does not exists this mean it is a "non relevant" measurement
												if (document.getElementsByName('S'+_sample+'T'+_test+'_ok')[0]){
													document.getElementsByName('S'+_sample+'T'+_test+'_ok')[0].checked = true;
													this.QCOrder.samples[_sample].tests[_test].MeasurementOK = true;
													f.parentNode.parentNode.cells[0].innerHTML = ui.fa('check-circle');
													f.parentNode.parentNode.cells[0].className = 'has-text-success';
												} else{
													//For Non Relevant variables we display different icon
													this.QCOrder.samples[_sample].tests[_test].MeasurementOK = true;
													f.parentNode.parentNode.cells[0].innerHTML = ui.fa('minus');
													f.parentNode.parentNode.cells[0].className = 'has-text-success';
												}
													
												
											} else {
												ux.set(f,"error");
												if (document.getElementsByName('S'+_sample+'T'+_test+'_ok')[0]){
													document.getElementsByName('S'+_sample+'T'+_test+'_ok')[0].checked = false;
													this.QCOrder.samples[_sample].tests[_test].MeasurementOK = false;
													f.parentNode.parentNode.cells[0].innerHTML = ui.fa('exclamation-triangle');
													f.parentNode.parentNode.cells[0].className = 'has-text-danger';
												} else{
													this.QCOrder.samples[_sample].tests[_test].MeasurementOK = false;
													f.parentNode.parentNode.cells[0].innerHTML = ui.fa('minus');
													f.parentNode.parentNode.cells[0].className = 'has-text-danger';
												}
											}
											this.QCOrder.samples[_sample].tests[_test].MeasurementNumber=+f.value;
										} else {
											console.log('Error Saving the data... O('+_qcOrder+') S('+this.QCOrder.samples[_sample].LineNumber+') T('+this.QCOrder.samples[_sample].tests[_test].LineNumber2+') = '+f.value, result);
										}
									}.bind(this)
								, {method:'PUT',contentType:'json',timeout:180000}
							);		
	}
	// ........................................................................................................................................................................................................................
	tabTests_dg_saveMeasurementString(_test,f) {
		let _qcOrder = this.QCOrder.DocEntry;
		let _sample = this.currentSample;

		//SM::31/01/2022 TFS 68936 - added String validation
		let mok = (+f.value != "");
		//console.log('ToDo: Save the data... O('+_qcOrder+') S('+this.QCOrder.samples[_sample].LineNumber+') T('+this.QCOrder.samples[_sample].tests[_test].LineNumber2+') = '+f.value);
		console.log('ToDo: Save the data... O('+_qcOrder+') S('+_sample+') T('+_test+') = '+f.value);
		ux.saveAll(	'/odata4/v1/QCOrderMeasurement('+encodeURIComponent(this.QCOrder.DocEntry)+','+ux.encodeODataString(this.QCOrder.samples[_sample].LineNumber)+','+encodeURIComponent(this.QCOrder.samples[_sample].tests[_test].LineNumber2)+')' //?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID
								, {MeasurementString:f.value}
								, function(err, result) {
										if (!err){ 
											this.QCOrder.samples[_sample].tests[_test].MeasurementString=f.value;
											console.log('Saved the data... O('+_qcOrder+') S('+this.QCOrder.samples[_sample].LineNumber+') T('+this.QCOrder.samples[_sample].tests[_test].LineNumber2+') = '+f.value, result);
											//SM::31/01/2022 - TFS 68936 - added automatic checkbox selection according to what has been included in the select input
											if (mok) {
												ux.set(f,"clear");
												if (document.getElementsByName('S'+_sample+'T'+_test+'_ok')[0]){
													document.getElementsByName('S'+_sample+'T'+_test+'_ok')[0].checked = true;
													this.QCOrder.samples[_sample].tests[_test].MeasurementOK = true;
													f.parentNode.parentNode.cells[0].innerHTML = ui.fa('check-circle');
													f.parentNode.parentNode.cells[0].className = 'has-text-success';
												} else{
													//For Non Relevant variables we display different icon
													this.QCOrder.samples[_sample].tests[_test].MeasurementOK = true;
													f.parentNode.parentNode.cells[0].innerHTML = ui.fa('minus');
													f.parentNode.parentNode.cells[0].className = 'has-text-success';
												}
											} else {
												ux.set(f,"error");
												if (document.getElementsByName('S'+_sample+'T'+_test+'_ok')[0]){
													document.getElementsByName('S'+_sample+'T'+_test+'_ok')[0].checked = false;
													this.QCOrder.samples[_sample].tests[_test].MeasurementOK = false;
													f.parentNode.parentNode.cells[0].innerHTML = ui.fa('exclamation-triangle');
													f.parentNode.parentNode.cells[0].className = 'has-text-danger';
												} else{
													this.QCOrder.samples[_sample].tests[_test].MeasurementOK = false;
													f.parentNode.parentNode.cells[0].innerHTML = ui.fa('minus');
													f.parentNode.parentNode.cells[0].className = 'has-text-danger';
												}
											}
										} else {
											console.log('Error Saving the data... O('+_qcOrder+') S('+this.QCOrder.samples[_sample].LineNumber+') T('+this.QCOrder.samples[_sample].tests[_test].LineNumber2+') = '+f.value, result);
										}
									}.bind(this)
								, {method:'PUT',contentType:'json',timeout:180000}
							);		
	}
	// ........................................................................................................................................................................................................................
	tabTests_dg_saveMeasurementOk(_test,f) {
		let _qcOrder = this.QCOrder.DocEntry;
		let _sample = this.currentSample;

		console.log('ToDo: Save the data... O('+_qcOrder+') S('+this.QCOrder.samples[_sample].LineNumber+') T('+this.QCOrder.samples[_sample].tests[_test].LineNumber2+') = '+(f.checked?'true':'false'));
		ux.saveAll(	'/odata4/v1/QCOrderMeasurement('+encodeURIComponent(this.QCOrder.DocEntry)+','+ux.encodeODataString(this.QCOrder.samples[_sample].LineNumber)+','+encodeURIComponent(this.QCOrder.samples[_sample].tests[_test].LineNumber2)+')' //?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID
								, {MeasurementOK:f.checked}
								, function(err, result) {
										if (!err){ 
											console.log('Saved the data... O('+this.QCOrder.DocEntry+') S('+this.QCOrder.samples[_sample].LineNumber+') T('+this.QCOrder.samples[_sample].tests[_test].LineNumber2+') = '+f.value, result);
											if ( f.checked ) {
												this.QCOrder.samples[_sample].tests[_test].MeasurementOK = true;
												f.parentNode.parentNode.cells[0].innerHTML = ui.fa('check-circle');
												f.parentNode.parentNode.cells[0].className = 'has-text-success';
											} else {
												this.QCOrder.samples[_sample].tests[_test].MeasurementOK = false;
												f.parentNode.parentNode.cells[0].innerHTML = ui.fa('exclamation-triangle');
												f.parentNode.parentNode.cells[0].className = 'has-text-danger';
											}
										} else {
											console.log('Error Saving the data... O('+this.QCOrder.DocEntry+') S('+this.QCOrder.samples[_sample].LineNumber+') T('+this.QCOrder.samples[_sample].tests[_test].LineNumber2+') = '+f.value, result);
										}
									}.bind(this)
								, {method:'PUT',contentType:'json',timeout:180000}
							);		
	}
	// ........................................................................................................................................................................................................................




	//  _____     _   _____       _              _         _ _     _    _           _   _          _   
	// |_   _|_ _| |_|_   _|__ __| |_ ___  ___  (_)_ _  __| (_)_ _(_)__| |_  _ __ _| | | |_ ___ __| |_ 
	//   | |/ _` | '_ \| |/ -_|_-<  _(_-< |___| | | ' \/ _` | \ V / / _` | || / _` | | |  _/ -_|_-<  _|
	//   |_|\__,_|_.__/|_|\___/__/\__/__/       |_|_||_\__,_|_|\_/|_\__,_|\_,_\__,_|_|  \__\___/__/\__|
	// ........................................................................................................................................................................................................................
	tabTests_di_gui() {
		return '&nbsp;'
				+ui.box(
					/*ui.label('tPosText',_t('Position'))
					+*/
					ui.label('tQCOrder',_t('QC Order'))
				)
				+ui.tabs("tabTest"
						,[	
							{icon:ui.fa("eye"), title:_t("Measurement"), active:true
								, content:
										
										ui.columns([
													{content:'<div id="QCValue_div"></div>' /*ui.input( _t('Value'), 'tValue','', {licon:"fa-info"})*/,size:'3/4'}
												,{content:'<br>'+ui.checkbox( _t('OK'), 'tMeasurementOK',false)}
												],
												{isMobile:true}
										)
									+	ui.select( _t('Blockage Reason'), 'tBlockageReasonId', '', this.cache_blockReason )
									+	ui.input( '', 'tBlockageReasonText','', {licon:"fa-info"})
									+	ui.select( _t('Valuation'), 'tValuationId', '', this.cache_valuation )
									+	ui.input( '', 'tValuationText','', {licon:"fa-info"})
								, id:"tabTest_M"
							}
							,{icon:ui.fa("info"), title:_t("Methodology"), content:ui.box('',{id:'tInfo'}), id:"tabTest_I"}
						]
				);
	}
	// ........................................................................................................................................................................................................................
	tabTests_di_ux() {
		ux.tabs('tabsTest', 'init');
		/*
		ux.listen('change', "tValue", function (e) { 
														this.QCOrder.samples[this.currentSample].tests[this.currentTest]._changed = true;
														switch(this.QCOrder.samples[this.currentSample].tests[this.currentTest].Type) {
															case 'L':
															case 'T':
																this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementString = document.getElementsByName('tValue')[0].value;
																break;
															case 'I':
															default:	
																this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementNumber = document.getElementsByName('tValue')[0].value;
																this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementOK = !(this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementNumber < this.QCOrder.samples[this.currentSample].tests[this.currentTest].Minimal || this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementNumber > this.QCOrder.samples[this.currentSample].tests[this.currentTest].Maximum )
																break;
														}
														
														this.tabTests_di_display();
													}.bind(this) 
				);
		*/

		ux.listen('change', "tMeasurementOK", function (e) { 
														this.QCOrder.samples[this.currentSample].tests[this.currentTest]._changed = true;
														this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementOK = document.getElementsByName('tMeasurementOK')[0].checked;
														this.tabTests_di_display();
													}.bind(this) 
				);

		ux.listen('change', "tBlockageReasonId", function (e) {
														this.QCOrder.samples[this.currentSample].tests[this.currentTest]._changed = true;
														this.QCOrder.samples[this.currentSample].tests[this.currentTest].BlockageReasonId = document.getElementsByName('tBlockageReasonId')[0].value;
														this.tabTests_di_display();
													}.bind(this) 
				);

		ux.listen('change', "tBlockageReasonText", function (e) { 
														this.QCOrder.samples[this.currentSample].tests[this.currentTest]._changed = true;
														this.QCOrder.samples[this.currentSample].tests[this.currentTest].BlockageReasonText = document.getElementsByName('tBlockageReasonText')[0].value;
														this.tabTests_di_display();
													}.bind(this) 
				);

		ux.listen('change', "tValuationId", function (e) { 
														this.QCOrder.samples[this.currentSample].tests[this.currentTest]._changed = true;
														this.QCOrder.samples[this.currentSample].tests[this.currentTest].ValuationId = document.getElementsByName('tValuationId')[0].value;
														this.tabTests_di_display();
													}.bind(this) 
				);

		ux.listen('change', "tValuationText", function (e) { 
														this.QCOrder.samples[this.currentSample].tests[this.currentTest]._changed = true;
														this.QCOrder.samples[this.currentSample].tests[this.currentTest].ValuationText = document.getElementsByName('tValuationText')[0].value;
														this.tabTests_di_display();
													}.bind(this) 
				);
	}
	// ........................................................................................................................................................................................................................
	tabTests_di_display(f=null) {
		let type = this.QCOrder.samples[this.currentSample].tests[this.currentTest].Type;
		switch(type) {
			case 'L':
			case 'T':
				document.getElementsByName("tValue")[0].value = this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementString;
				ux.set('tValue','subtitle','');
				break;
			case 'I':
			default:				
				document.getElementsByName("tValue")[0].value = this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementPersonellId?ux.formatNumber(this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementNumber,this.QCOrder.samples[this.currentSample].tests[this.currentTest].RoundDec):'';
				ux.set('tValue','subtitle', ux.formatNumber(this.QCOrder.samples[this.currentSample].tests[this.currentTest].Minimal,this.QCOrder.samples[this.currentSample].tests[this.currentTest].RoundDec||6)
											+' >= | ' +
											ux.formatNumber(this.QCOrder.samples[this.currentSample].tests[this.currentTest].DesiredValue,this.QCOrder.samples[this.currentSample].tests[this.currentTest].RoundDec||6)
											+' | <= ' +
											ux.formatNumber(this.QCOrder.samples[this.currentSample].tests[this.currentTest].Maximum,this.QCOrder.samples[this.currentSample].tests[this.currentTest].RoundDec||6)
											);
				break;
		}


		if ( type=='T' ) {
			ux.set('tMeasurementOK','hidden');
			ux.set('tBlockageReasonId','hidden');
			ux.set('tBlockageReasonText','hidden');
			ux.set('tValuationId','hidden');
			ux.set('tValuationText','hidden');
		} else {
			ux.set('tMeasurementOK','show');
			ux.set('tBlockageReasonId','show');
			ux.set('tBlockageReasonText','show');
			ux.set('tValuationId','show');
			ux.set('tValuationText','show');

			document.getElementsByName("tMeasurementOK")[0].checked = this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementOK;

			document.getElementsByName("tBlockageReasonId")[0].value = this.QCOrder.samples[this.currentSample].tests[this.currentTest].BlockageReasonId;
			document.getElementsByName("tBlockageReasonText")[0].value = this.QCOrder.samples[this.currentSample].tests[this.currentTest].BlockageReasonText;

			document.getElementsByName("tValuationId")[0].value = this.QCOrder.samples[this.currentSample].tests[this.currentTest].ValuationId;
			document.getElementsByName("tValuationText")[0].value = this.QCOrder.samples[this.currentSample].tests[this.currentTest].ValuationText;
		}

		this.tabTests_di_check(f);
	}
	// ........................................................................................................................................................................................................................
	tabTests_di_check(f=null) {
		let hasError = false;

		switch(this.QCOrder.samples[this.currentSample].tests[this.currentTest].Type) {
			case 'L':
				ux.set('tValue','clear');
				ux.set('tMeasurementOK','clear');
				ux.set('tMeasurementOK','show');
				break;
			case 'T':
				ux.set('tValue','clear');
				ux.set('tMeasurementOK','hidden');
				break;
			case 'I':
			default:
				if ( this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementNumber < this.QCOrder.samples[this.currentSample].tests[this.currentTest].Minimal
				  || this.QCOrder.samples[this.currentSample].tests[this.currentTest].MeasurementNumber > this.QCOrder.samples[this.currentSample].tests[this.currentTest].Maximum
				) {
//					hasError = true;
					ux.set('tValue','error');
				} else {
					ux.set('tValue','clear');
				}
				ux.set('tMeasurementOK','disabled');
				break;
		}		

		ux.focus(this.tabTests_di_controls, f||document.activeElement.name);
		if ( hasError ) ux.set("appSave","disabled"); else ux.set("appSave","enable"); 
		return hasError;
	}
	// ........................................................................................................................................................................................................................




	//  ___                 ___       _        
	// / __| __ ___ _____  |   \ __ _| |_ __ _ 
	// \__ \/ _` \ V / -_) | |) / _` |  _/ _` |
	// |___/\__,_|\_/\___| |___/\__,_|\__\__,_|
	// ........................................................................................................................................................................................................................
	saveAll() {
		switch(ux.tabs('MApp','active')) {
			case 'tabSamples':
				let s = this.QCOrder.samples[this.currentSample];
				if ( !s._errors && s._changed ) {
					let bsl = {
								Release1:s.Release1||'',
								Release2:s.Release2||false,
								ValuationId:s.ValuationId||'',
								ValuationText:s.ValuationText||'',
								BlockageReasonId:s.BlockageReasonId||'',
								BlockageReasonText:s.BlockageReasonText||''
					};
					console.log('ToDo: Save sample... O('+this.QCOrder.DocEntry+') S('+this.QCOrder.samples[this.currentSample].LineNumber+')');
					ux.saveAll(	'/odata4/v1/QCOrderSamples('+encodeURIComponent(this.QCOrder.DocEntry)+','+ux.encodeODataString(this.QCOrder.samples[this.currentSample].LineNumber)+')' // ?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID
											, bsl
											, function(err, result) {
													if ( !ux.aError(result) ){ 
														console.log('Saved the sample... O('+this.QCOrder.DocEntry+') S('+this.QCOrder.samples[this.currentSample].LineNumber+')', result);
														this.QCOrder.samples[this.currentSample]._changed=false;
														this.QCOrder.samples[this.currentSample]._org=null;

														document.getElementById('tabSamples-di').style.display='none';
														document.getElementById('tabSamples').appendChild( document.getElementById('tabSamples-di') );
														document.getElementById('dgl_sample_info_save').remove();
													} else {
														console.log('Error Saving the sample... O('+this.QCOrder.DocEntry+') S('+this.QCOrder.samples[this.currentSample].LineNumber+')', result);
													}
												}.bind(this)
											, {method:'PUT',contentType:'json',timeout:180000}
					);
				} else {
					document.getElementById('tabSamples-di').style.display='none';
					document.getElementById('tabSamples').appendChild( document.getElementById('tabSamples-di') );
					document.getElementById('dgl_sample_info_save').remove();
				}
				break;

			case 'tabTests':
				let t = this.QCOrder.samples[this.currentSample].tests[this.currentTest];
				if ( !t._errors && t._changed ) {
					let bsl = {
								 BlockageReasonId:t.BlockageReasonId||''
								,BlockageReasonText:t.BlockageReasonText||''
								,ValuationId:t.ValuationId||''
								,ValuationText:t.ValuationText||''
					};
					switch(this.QCOrder.samples[this.currentSample].tests[this.currentTest].Type) {
						case 'L':
							bsl.MeasurementString=t.MeasurementString;
							bsl.MeasurementOK=t.MeasurementOK;
							break;
						case 'T':
							bsl.MeasurementString=t.MeasurementString;
							break;
						default:
							bsl.MeasurementNumber=+t.MeasurementNumber;
							bsl.MeasurementOK=t.MeasurementOK;
							break;
					}

					console.log('ToDo: Save test... O('+this.QCOrder.DocEntry+') S('+this.QCOrder.samples[this.currentSample].LineNumber+') T('+this.QCOrder.samples[this.currentSample].tests[this.currentTest].LineNumber2+')');
					ux.saveAll(	'/odata4/v1/QCOrderMeasurement('+encodeURIComponent(this.QCOrder.DocEntry)+','+ux.encodeODataString(this.QCOrder.samples[this.currentSample].LineNumber)+','+encodeURIComponent(this.QCOrder.samples[this.currentSample].tests[this.currentTest].LineNumber2)+')' // ?$ProgramId='+appInfo.gid+'&$AppId='+appInfo.appID
											, bsl
											, function(err, result) {
													if ( !ux.aError(result) ){  
														console.log('Saved the data... O('+this.QCOrder.DocEntry+') S('+this.QCOrder.samples[this.currentSample].LineNumber+') T('+this.QCOrder.samples[this.currentSample].tests[this.currentTest].LineNumber2+')', result);
														this.QCOrder.samples[this.currentSample].tests[this.currentTest]._changed=false;
														this.QCOrder.samples[this.currentSample].tests[this.currentTest]._org=null;

														document.getElementById('tabTests-di').style.display='none';
														document.getElementById('tabTests').appendChild( document.getElementById('tabTests-di') );
														document.getElementById('dgl_test_info_save').remove();
									
														ux.tabs('MApp','active','tabTests');
													} else {
														console.log('Error Saving the data... O('+this.QCOrder.DocEntry+') S('+this.QCOrder.samples[this.currentSample].LineNumber+') T('+this.QCOrder.samples[this.currentSample].tests[this.currentTest].LineNumber2+')', result);
													}
												}.bind(this)
											, {method:'PUT',contentType:'json',timeout:180000}
										);		
				} else {
					document.getElementById('tabTests-di').style.display='none';
					document.getElementById('tabTests').appendChild( document.getElementById('tabTests-di') );
				}
				break;
		}
	}
	// ........................................................................................................................................................................................................................
	attachments_upload() {
		let url = '?program_id='+appInfo.gid+'&page=lib_rest&a=qcDocumentUpload&qcid='+encodeURIComponent(app.QCOrder.DocEntry)+'&sid=0&tid=0';
		app.attachmentsViewer.upload(url);
	}
}

var app = new app_qc_sample;