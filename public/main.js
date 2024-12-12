

$(document).ready(function () {

    if ($.cookie('sessionkey') == undefined) {
        $('#register').css('visibility', 'visible')
        $('#loginScreen').css('visibility', 'visible')
    }
    else {
        //  $('#profile-name').html($('#'))
        connectToDataBase('loadProfile', $.cookie('sessionkey'), '', '', '', '')
    }
    $('input').on('mouseup', function (evt) {
        evt.preventDefault()

        switch (this.id) {
            case 'send':
                text = $('#text').val()
                doSend('&nbsp;' + ` [${username}] ` + ' --> ' + text)
                $('#text').val('')

                break
            case 'setUser':
                if ($.cookie('sessionkey') == undefined) {
                    password = $('#newpassword').val()
                    user = $('#newusername').val()

                    if (password == '' || user == '') {
                        alert('Name or password cant be empty!')
                        break
                    }

                    connectToDataBase('newUser', user, password)

                }
                else {
                    $('#register').css('visibility', 'hidden')
                    $('#loginScreen').css('visibility', 'hidden')
                }
                break

            case 'login':
                password = $('#password').val()
                user = $('#username').val()

                if (password == '' || user == '') {
                    alert('Name or password cant be empty!')
                    break
                }
                connectToDataBase('checkLoginCredentials', user, password)
                break

            case 'edit-profiledesc':
                $('#profile-description').removeAttr('readonly');
                $('#profile-age').removeAttr('readonly');
                $('#profile').addClass('edit-mode');
                break

            case 'save-profile':
                description = $('#profile-description').val()
                age = $('#profile-age').val()
                $('#profile-description').attr('readonly', 'true');
                $('#profile-age').attr('readonly', 'true');
                $('#profile').removeClass('edit-mode');
                connectToDataBase('updateProfile', $.cookie('sessionkey'), '', age, description)
                break

            case 'add-friend':
                userToRequest = $('#stranger-profilename')

                connectToDataBase('sendFriendRequest', username, '', '', '', userToRequest)
                break
        }
    });


    $(document).on('mouseup', 'p', function (evt) {
        evt.stopPropagation()
        stranger = $(this).text().match(/\[([^\]]+)\]/)
        if (stranger[1] != username) {
            connectToDataBase('loadStrangerProfile', stranger[1], '', '', '')
        }
    })

    $(document).on('mouseup', 'li', function (evt) {
        evt.stopPropagation()

        switch (this.id) {

            case 'showprofiles-option':
                 $('#profiles-section').css({
                    opacity: '1',
                    transition: 'opacity 0.3s ease-in-out',
                    'z-index': 1

                 })
                 $('#friendlist-section').css({               
                    opacity: '0',
                    transition: 'opacity 0.3s ease-in-out',
                    'z-index': -1
                 })
            break

            case 'showfriends-option':
                $('#profiles-section').css({               
                    opacity: '0',
                    transition: 'opacity 0.3s ease-in-out',
                    'z-index': -1
                 })
                 $('#friendlist-section').css({               
                    opacity: '1',
                    transition: 'opacity 0.3s ease-in-out',
                    'z-index': 1
                 })
            break
        }
    })
});


function connectToDataBase(action, name, password, age, description, friend) {
    fetch('https://monthly-devoted-pug.ngrok-free.app/databaseupdates', {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: action,
            name: name,
            password: password,
            age: age,
            description: description
        })
    })
        .then(response => response.json())
        .then(data => {

            switch (action) {
                case 'newUser':

                    if (data.error != undefined && data.error == 'DUPLICATEDUSER') {
                        alert('ERROR: User already exists')
                        break
                    }

                    $.cookie('sessionkey', data.sessionKey)
                    alert(`User: "${name}" created successfully!`)
                    location.reload()


                case 'checkLoginCredentials':

                    if (data.message == 'LOGIN SUCCESSFUL!') {
                        $('#register').css('visibility', 'hidden')
                        $('#loginScreen').css('visibility', 'hidden')
                        $.cookie('sessionkey', data.sessionKey[0][0].sessionkey)
                        $('#profile-name').html(name)
                        connectToDataBase('loadProfile', $.cookie('sessionkey'), '', '', '', '')
                    }
                    alert(data.message)
                    break

                case 'updateProfile':
                    $('#profile-description').val(description);
                    $('#profile-age').val(age);
                    alert(data.message)
                    break

                case 'loadProfile':
                    $('#profile-name').html(data.userName[0][0].username);
                    $('#profile-age').val(data.userAge[0][0].age);
                    $('#profile-description').val(data.userDesc[0][0].description);
                    username = data.userName[0][0].username
                    break

                case 'loadStrangerProfile':
                    $('#stranger-profileage').html(data.strangerAge[0][0].age);
                    $('#stranger-profiledesc').val(data.strangerDesc[0][0].description);
                    $('#stranger-profilename').html(data.strangerName[0][0].username);
                    break

                case 'sendFriendRequest':
                    //something something something
                    break
            }
        })
        .catch(error => {
            console.error('Error in database operation:', error);

        });
}
