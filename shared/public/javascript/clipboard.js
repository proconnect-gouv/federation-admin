import ClipboardJS from 'clipboard';
import $ from 'jquery';

export function copyText () {
	eventCleanerListenerForTooltip('.copy-button');
	const clipboard = new ClipboardJS('.copy-button');

	clipboard.on('success', function(e) {
		e.clearSelection();
		console.info('Action:', e.action);
		console.info('Text:', e.text);
		console.info('Trigger:', e.trigger);

		showTooltip(e.trigger,'Copié !');     
	});

	clipboard.on('error', function(e) {
		console.error('Action:', e.action);
		console.error('Trigger:', e.trigger);
	});
}

function eventCleanerListenerForTooltip (elm) {
	$(elm).tooltip('disable');
	const btns=document.querySelectorAll(elm);
	for(let i=0;i<btns.length;i++){
		btns[i].addEventListener('mouseleave',clearTooltip);
		btns[i].addEventListener('blur',clearTooltip);
	}
}

function clearTooltip(e){
	$('.copy-button').tooltip('hide');
	$('.copy-button').tooltip('disable');
}

function showTooltip(elm){
	$(elm).tooltip('enable');
	$(elm).tooltip('show');
}
