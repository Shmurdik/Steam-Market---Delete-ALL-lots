// ==UserScript==
// @name         Steam Market - Delete ALL lots
// @namespace    Shmurdik
// @version      0.1
// @description  Steam Market - Delete ALL lots
// @author       Shmurdik
// @match        http://steamcommunity.com/market/
// @match        http://steamcommunity.com/market/listings/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if(typeof(Storage) == "undefined") {alert("Sorry, your browser does not support web storage..."); return;}

    $J('#tabContentsMyListings').before('<a href="#delete_all_lots" class="item_market_action_button item_market_action_button_edit nodisable"><span id="delete_all_lots" class="item_market_action_button_contents">Delete ALL lots</span></a>');

    if(localStorage.steammarketdeletealllotsinprogress) {DeleteCurrentLots();}

    function DeleteCurrentLots(){
        $J(document).bind( "dblclick", function() {
            if(confirm("Cancel?")) {localStorage.removeItem("steammarketdeletealllotsinprogress"); location.reload();}
        });
        localStorage.steammarketdeletealllotsinprogress = 1;
        var deleted = 0;
        var total = $J('#tabContentsMyActiveMarketListingsRows').find('div.market_listing_cancel_button').length;
        if(total <= 0) { alert('Not found lots. Nothing to do.'); localStorage.removeItem("steammarketdeletealllotsinprogress"); return false; }
        var modal = ShowBlockingWaitDialog( 'Executing...', 'Please wait until all requests finish. Ignore all the errors, let it finish.' );
        $J('#tabContentsMyActiveMarketListingsRows').find('div.market_listing_cancel_button').each(function(i, el){
            var res = $J(this).html().match(/RemoveMarketListing\('[\/]?mylisting', '(\d+)', (\d+), '(\d+)', '(\d+)'/i);
            if(!res) {res = $J(this).html().match(/type="checkbox" class="lfremove" data-listingid="(\d+)"/i);}
            if(res){
                jQuery.post('//steamcommunity.com/market/removelisting/'+res[1],
                            {sessionid: g_sessionID}
                ).always(function(data){
                    deleted++;
                    modal.Dismiss();
                    if(deleted >= total)
                    {
                        modal = ShowBlockingWaitDialog( 'Executing...', 'Current page is done! Reloading in 5 sec...' );
                        //localStorage.steammarketdeletealllotsinprogress = 1;
                        setTimeout(function() { location.reload(); }, 5000);
                        //location.reload();
                    }
                    else
                    {
                        modal = ShowBlockingWaitDialog( 'Executing...', 'Deleted <b>' + deleted + '</b> of ' + total + '.' );
                    }
				});
            }
            else
            {
                modal.Dismiss();
                modal = ShowBlockingWaitDialog( 'Error!', 'Not found RemoveMarketListing.' );
                //alert($J(this).html());
            }
        });
    }
    $J("#delete_all_lots").click(function(){
        if(confirm("Remove ALL lots?")) {DeleteCurrentLots();}
    });
})();
