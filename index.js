URL_USER = 'https://habitica.com/api/v3/user';
URL_MESSAGE = 'https://habitica.com/api/v3/members/send-private-message';
URL_MEMBER = 'https://habitica.com/api/v3/members'

$(document)
  .on('click', '#confirmSendGold', confirmSendGoldHandler)
  .on('click', '#sendGold', sendGoldHandler)
  .on('click', '#claimGold', claimGoldHandler);

function confirmSendGoldHandler(e) {
  if (validateForm(e) === false) return;

  let gifterId = $('#userID').val(),
      gifterToken = $('#apiToken').val(),
      recipientID = $('#recipientID').val(),
      goldToGive = parseFloat($('#gold').val()),
      headers = defaultHeaders(gifterId, gifterToken);

  let gifter = getUserFromId(gifterId, headers),
      recipient = getMemberProfile(recipientID, headers),
      errors = validateCanSendGold(gifter, recipient, goldToGive);

  if (errors.length !== 0) {
    return showErrorModal(errors);
  }

  sendGoldConfirmationModal(recipient, goldToGive);
}

function sendGoldHandler(e) {
  if (validateForm(e) === false) return;

  let gifterId = $('#userID').val(),
      gifterToken = $('#apiToken').val(),
      recipientID = $('#recipientID').val(),
      goldToGive = parseFloat($('#gold').val()),
      userMessage = $('#giftMessage').val(),
      headers = defaultHeaders(gifterId, gifterToken);

  let gifter = getUserFromId(gifterId, headers),
      recipient = getMemberProfile(recipientID, headers);

  sendGold(gifterId, recipientID, goldToGive, userMessage, headers);
}

function sendGoldConfirmationModal(recipient, gold) {
  let body = $('#confirmModal .modal-body'),
      p = document.createElement('p');

  body.empty();
  p.innerHTML = `Send ${gold} gold to ${recipient.data.auth.local.username}?`;
  body.append(p);

  (new bootstrap.Modal('#confirmModal')).show();
}

function validateCanSendGold(gifter, recipient, goldToGive) {
  let errors = [];

  if (gifter == null) {
    errors.push('Something has gone wrong. Please verify your User ID and API Token are correct and try again.');
  } else if ((gifter.data.stats.gp - goldToGive) < 0) {
    errors.push(`Not enough gold in your account. You have ${gifter.data.stats.gp} gold.`);
  }

  if (recipient == null) {
    errors.push('Unable to find the user you are trying to send gold to. Please verify their User ID is correct and try again.');
  }

  return errors;
}

function validateCanClaimGold(user, gold) {
  let errors = [];

  if (user == null) {
    errors.push('Something has gone wrong. Please verify your User ID and API Token are correct and try again.');
  }

  return errors;
}

function sendGold(gifterId, recipientID, goldToGive, userMessage, headers) {
  let gifter = getUserFromId(gifterId, headers),
      updatedGoldValue = parseFloat(gifter.data.stats.gp) - goldToGive,
      message = giftMessage(gifter.data.auth.local.username, goldToGive, userMessage);

  if (updatedGoldValue < 0) {
    console.log('not enough gold in account');
    return;
  }

  updateGold(gifterId, updatedGoldValue, headers);
  sendMessage(recipientID, message, headers);
}

function claimGoldHandler(e) {
  if (validateForm(e) === false) return;

  e.preventDefault();
  let recipientID = $('#userID').val(),
      recipientToken = $('#apiToken').val(),
      gold = parseFloat($('#gold').text()),
      headers = defaultHeaders(recipientID, recipientToken),
      recipient = getUserFromId(recipientID, headers);
      errors = validateCanClaimGold(recipient, gold);

  if (errors.length !== 0) {
    return showErrorModal(errors);
  }

  claimGold(recipientID, gold, headers);
}

function claimGold(recipientID, gold, headers) {
  let user = getUserFromId(recipientID, headers),
      updatedGoldValue = parseFloat(user.data.stats.gp) + gold;

  updateGold(recipientID, updatedGoldValue, headers);
}

function getUserFromId(userID, headers) {
  return contactHabitica('GET', `${URL_USER}?userFields=stats.gp`, headers);
}

function updateGold(userID, gold, headers) {
  data = JSON.stringify({
    "stats.gp": gold
  });

  console.log(`setting ${userID}'s gold to ${gold}`);
  return contactHabitica('PUT', URL_USER, headers, data);
}

function sendMessage(to, message, headers) {
  data = JSON.stringify({
    message: message,
    toUserId: to
  });

  console.log(`sending message to ${to}:\n${message}`);
  return contactHabitica('POST', URL_MESSAGE, headers, data);
}

function getMemberProfile(memberID, headers) {
  return contactHabitica('GET', `${URL_MEMBER}/${memberID}`, headers);
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
      result = error;
      console.log(error);
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
  let message = `You have been sent ${goldAmount} gold by ${gifter}!\n\n`;

  if (userMessage) {
    message += `\`${userMessage}\`\n\n`
  }

  message += `To claim your reward, go to ${giftLink(gifter, goldAmount, userMessage)}`

  return message
}

function giftLink(userName, gold, userMessage, transactionID) {
  let queryString = new URLSearchParams({
    from: userName,
    gold: gold,
    message: userMessage,
    transactionID: transactionID
  }).toString();

  return `${baseURL()}/receive.html?${queryString}`;
}

function baseURL() {
  let pathArr = window.location.pathname.split('/');
  pathArr.pop()
  return window.location.origin + pathArr.join('/');
}

function validateForm(e) {
  let form = $(e.target).closest('form')[0];
  e.preventDefault();
  form.classList.add('was-validated');
  return form.checkValidity();
}

function showErrorModal(errors) {
  let body = $('#errorModal .modal-body');
  body.empty();

  errors.forEach((error, i) => {
    var p = document.createElement('p');
    p.innerHTML = error;

    body.append(p);
  });

  (new bootstrap.Modal('#errorModal')).show();
}
