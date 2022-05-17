const urlParams = new URLSearchParams(window.location.search);

$(document).ready(initializeForm)

function initializeForm() {
  let gold = parseFloat(urlParams.get('gold'));

  if (gold > 0) {
    $('#gifterUserName').text(urlParams.get('from'));
    $('#giftMessage').text(urlParams.get('message'));
    $('#gold').text(urlParams.get('gold'));

    $('#goodToGoAlert').show();
    $('#claimGold').removeAttr("disabled");
  } else {
    $('#badUrlAlert').show();
  }
}
