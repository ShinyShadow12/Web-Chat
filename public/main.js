

$(document).ready(function () {

   

    if ($.cookie('sessionkey') == undefined) {
        $('#register').css('visibility', 'visible')
        $('#loginScreen').css('visibility', 'visible')
    }
    else {
        connectToServer('loadProfile', $.cookie('sessionkey'), '', '', '', '')
        //
    }
    $('input').on('mouseup', function (evt) {
        evt.preventDefault()


        switch (this.id) {
            case 'send':
                text = $('#text').val()
                doSend('&nbsp;' + ` [${username}] ` + ' --> ' + text, 'globalmsg')
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
                    connectToServer('newUser', user, password)
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
                connectToServer('checkLoginCredentials', user, password)
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
                connectToServer('updateProfile', $.cookie('sessionkey'), '', age, description)
                break

            case 'send-friendreq':
                userToRequest = $('#stranger-profilename').text()            

                connectToServer('sendFriendRequest', username, '', '', '', userToRequest)
                break

            case 'notif-option1':
            case 'notif-option2':

                option = $(this).val()
                
                if (option == 'Accept Request') {
                    newFriend = $('.selected').children().text()
                    alert(newFriend) 
                    connectToServer('addFriend', username, '', '', '', newFriend, '')
                }
                else if (option == 'Decline Request') {
                    $('.selected').remove()
                    //connectToDataBase('removeNotifications')
                }
                break         
        }
    });


    $(document).on('mouseup', 'p', function (evt) {
        evt.stopPropagation()
        stranger = $(this).text().match(/\[([^\]]+)\]/)
        if (stranger[1] != username) {
            connectToServer('loadStrangerProfile', stranger[1], '', '', '')
        }

        if (friends.includes(stranger[1])) {
            $('#send-friendreq').attr('disabled', true);
        } else {
            $('#send-friendreq').attr('disabled', false);
        }
    })

    $(document).on('mouseup', 'li', function (evt) {
        evt.stopPropagation()

        switch (this.id) {

            case 'showprofiles-option':
                 $('#profiles-section').css({
                    opacity: '1',
                    display: 'block',
                    transition: 'opacity 0.3s ease-in-out',
                    'z-index': 1
                 })
                 $('#friendlist-section').css({               
                    opacity: '0',
                    display: 'none',
                    transition: 'opacity 0.3s ease-in-out',
                    'z-index': -1
                 })
            break

            case 'showfriends-option':
                $('#profiles-section').css({               
                    opacity: '0',
                    display: 'none',
                    transition: 'opacity 0.3s ease-in-out',
                    'z-index': -1
                 })
                 $('#friendlist-section').css({               
                    opacity: '1',
                    display: 'block',
                    transition: 'opacity 0.3s ease-in-out',
                    'z-index': 1
                 })
            break

            case 'switch-chat':
                 
            break

            case 'friendreq-tab':
                $('#notifications-messages').css('visibility', 'hidden')
                $('#notifications-global').css('visibility', 'hidden')
                $('#notifications-friendreq').css('visibility', 'visible')

                $('#notif-option1').val('Accept Request');
                $('#notif-option2').val('Decline Request');
                break
            case 'messages-tab':
                $('#notifications-messages').css('visibility', 'visible')
                $('#notifications-global').css('visibility', 'hidden')
                $('#notifications-friendreq').css('visibility', 'hidden')
                
                $('#notif-option1').val('Delete Message');
                $('#notif-option2').val('Open Message');
                break
            case 'global-tab':
                $('#notifications-messages').css('visibility', 'hidden')
                $('#notifications-global').css('visibility', 'visible')
                $('#notifications-friendreq').css('visibility', 'hidden')

                $('#notif-option1').val('Delete Message');
                $('#notif-option2').val('Forward to Global (future feature not doing this soon)');
                break             
    }

    parent = $(this).parent()
    validParents = ['notifications-friendreq', 'notifications-messages', 'notifications-global', 'friend-list']
    if (validParents.includes(parent[0].id) ) {

        $.each(validParents, function (index, element) { 
            $('#'+element).children().removeClass('selected')
        });

        $(this).addClass('selected');    
     } })
});


function connectToServer(action, name, password, age, description, friend) {
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
            description: description,
            friend: friend
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
                        connectToServer('loadProfile', $.cookie('sessionkey'), '', '', '', '')
                    }
                    alert(data.message)
                    break

                case 'updateProfile':
                    $('#profile-description').val(description);
                    $('#profile-age').val(age);
                    alert(data.message)
                    break

                case 'loadProfile':
                    $('#profile-name').html(data.userData[0][0].username);
                    $('#profile-age').val(data.userData[0][0].age);
                    $('#profile-description').val(data.userData[0][0].description);
                    username = data.userData[0][0].username

                    connectToServer('loadAllNotifications', username)
                    connectToServer('loadFriendList', username)
                  

                    $.each(data.globalHistory, function (index, globalmsg) { 
                        $('#globalChat').append( `<p id=chat-user> ${globalmsg} </p>`)
                        console.log(data.globalHistory)
                    });
                    
    
                    break

                case 'loadStrangerProfile':
                    $('#stranger-profileage').html(data.strangerData[0][0].age);
                    $('#stranger-profiledesc').val(data.strangerData[0][0].description);
                    $('#stranger-profilename').html(data.strangerData[0][0].username);
                    break

                case 'sendFriendRequest':
                    
                    alert(data.message)
                    break

                case 'addFriend':

                    alert('New friend added successfully!')
                    connectToServer('loadFriendList', username)

                    break

                case 'loadFriendList':
                    $('#friend-list').html('')
                    $.each(data.friendlist, function (index, element) { 
                       
                        $('#friend-list').append(`<li> <b class="friend-name"> ${element} </b> - Status: Offline </li>`)    
                        console.log(element)             
                    });
                    friends = data.friendlist;
                    break

                case 'loadAllNotifications':
                    
                    data.friendReqNotifications.forEach(reqnotif => {           
                        $('#notifications-friendreq').append(reqnotif.content)
                    });
                    break

                case 'removeNotifications':

                    //asjghdslkghskgldshgjsgls
                    break
            }
        })
        .catch(error => {
            console.error('Error in database operation:', error);

        });
}
