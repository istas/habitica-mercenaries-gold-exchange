URL_USER = 'https://habitica.com/api/v3/user';
URL_MESSAGE = 'https://habitica.com/api/v3/members/send-private-message';

$(document).on('click', '#sendGold', sendGoldHandler);

function sendGoldHandler(e) {
  e.preventDefault();
  let gifterId = $('#userID').val(),
      gifterToken = $('#apiToken').val(),
      recipientID = $('#recipientID').val(),
      goldToGive = $('#gold').val(),
      userMessage = $('#giftMessage').val();

  sendGold(gifterId, gifterToken, recipientID, goldToGive, userMessage);
}

function sendGold(gifterId, gifterToken, recipientID, goldToGive, userMessage) {
  let gifter = getUserFromId(gifterId, gifterToken),
      updatedGoldValue = gifter.data.stats.gp - goldToGive,
      message = giftMessage(gifter.data.auth.local.username, goldToGive, userMessage);

  if (updatedGoldValue < 0) {
    console.log('not enough gold in account');
    return;
  }

  updateGold(gifterId, gifterToken, updatedGoldValue);
  sendMessage(gifterId, gifterToken, recipientID, message);
}

function getUserFromId(userID, token) {
  return contactHabitica('GET', `${URL_USER}?userFields=stats.gp`, defaultHeaders(userID, token));
}

function updateGold(userID, token, gold) {
  data = JSON.stringify({
    "stats.gp": gold
  });

  console.log(`setting ${userID}'s gold to ${gold}`);
  // contactHabitica('PUT', URL_USER, defaultHeaders(userID, token), data);
}

function sendMessage(userID, token, to, message) {
  data = JSON.stringify({
    message: message,
    toUserId: to
  });

  console.log(`sending message to ${userID}: ${message}`);
  // contactHabitica('POST', URL_MESSAGE, defaultHeaders(userID, token), data);
}

function contactHabitica(method, url, headers, data) {
  let result = null;
  $.ajax({
    url: url,
    method: method,
    async: false,
    headers: headers,
    data: data,
    success: function (response) {
      result = response;
    },
    error: function (error) {
      console.log(`Error ${error}`);
    }
  })
  return result;
}

function defaultHeaders(userID, token) {
  return {
    // Do not remove x-client header.
    // Habitica requires this to be set to the author's ID in case they need to contact the owner to fix an issue.
    'x-client': '0274708f-7994-4224-9594-2625c747e83c-HabiticaGoldExchangeApp',
    'x-api-user': userID,
    'x-api-key': token,
    'Content-Type': 'application/json'
  }
}

function giftMessage(gifter, goldAmount, userMessage) {
  let baseMessage = `You have been sent ${goldAmount} gold by ${gifter}`;

  if (userMessage) {
    return `${baseMessage}: ${userMessage}`
  } else {
    return baseMessage;
  }
}
