URL_USER = 'https://habitica.com/api/v3/user';
URL_MESSAGE = 'https://habitica.com/api/v3/members/send-private-message';

$(document).on('click', '#sendGold', sendGoldHandler);

function sendGoldHandler(e) {
  e.preventDefault();
  sendGold();
}

async function sendGold() {
  let gifterId = $('#userId').val(),
      gifterToken = $('#apiToken').val(),
      recipientID = $('#recipientID').val(),
      goldToGive = $('#gold').val(),
      userMessage = $('#giftMessage').val();

  let gifter = await getUserFromId(gifterId, gifterToken);

  let updatedGoldValue = gifter.data.stats.gp - goldToGive;

  if (updatedGoldValue < 0) {
    console.log('not enough gold in account');
    return;
  }

  updateGold(gifterId, gifterToken, updatedGoldValue);

  let message = giftMessage(gifter.data.auth.local.username, goldToGive, userMessage);
  sendMessage(gifterId, gifterToken, recipientID, message);
}

async function getUserFromId(userId, token) {
  var opts = headers(userId, token, 'GET');
  const response = await fetch(`${URL_USER}?userFields=stats.gp`, opts);
  return response.json();
}

async function updateGold(userId, token, gold) {
  var opts = headers(userId, token, 'PUT');
  opts['body'] = JSON.stringify({
    "stats.gp": gold
  });

  console.log(`setting ${userId}'s gold to ${gold}`);
  // const response = await fetch(`${URL_USER}`, opts);
  // return response.json();
}

async function sendMessage(userId, token, to, message) {
  var opts = headers(userId, token, 'POST');
  opts['body'] = JSON.stringify({
    message: message,
    toUserId: to
  })

  console.log(`sending message to ${userId}: ${message}`);

  // const response = await fetch(`${URL_MESSAGE}`, opts);
  // return response.json();
}

function headers(userId, token, method) {
  return {
    method: method,
    headers: {
      // Do not remove x-client header.
      // Habitica requires this to be set to the author's (or presumably the maintainer's) in case they need to
      // contact the owner to fix an issue.
      'x-client': '0274708f-7994-4224-9594-2625c747e83c-HabiticaGoldExchangeApp',
      'x-api-user': userId,
      'x-api-key': token,
      'Content-Type': 'application/json'
    },
    redirect: 'follow'
  }
}

function giftMessage(gifter, goldAmount, userMessage) {
  let baseMessage = `You have been sent ${goldAmount} gold by ${gifter}`;

  if (userMessage === '') {
    return baseMessage;
  } else {
    return `${baseMessage}: ${userMessage}`
  }
}
