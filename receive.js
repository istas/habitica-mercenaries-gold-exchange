const urlParams = new URLSearchParams(window.location.search);

$(document).ready(initializeForm)

function initializeForm() {
  $('#gifterUserName').val(urlParams.get('from'));
  $('#giftMessage').val(urlParams.get('message'));
  $('#gold').val(urlParams.get('gold'));

  $('#claimGold').removeAttr("disabled");
}
