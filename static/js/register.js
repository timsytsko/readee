function send_xhr(method, addr, data, handler){
    let xhr = new XMLHttpRequest();
    xhr.open(method, addr);
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
        handler(xhr.response);
    };
    xhr.send(JSON.stringify(data));
}

document.getElementById('submit-btn').addEventListener('click', () => {
    send_xhr('POST', '/add_user',
        {
            'name': document.getElementById('name').value,
            'username': document.getElementById('username').value,
            'password': document.getElementById('password').value
        },
        function(rec_data) {
            error = rec_data.error
            if (error == 'too_long_name') {
                document.getElementById('welcome').innerHTML = 'Too Long Name';
                document.getElementById('welcome').style.color = '#dc3545';
            } else if (error == 'too_short_name') {
                document.getElementById('welcome').innerHTML = 'Too Short Name';
                document.getElementById('welcome').style.color = '#dc3545';
            } else if (error == 'too_long_username') {
                document.getElementById('welcome').innerHTML = 'Too Long Username';
                document.getElementById('welcome').style.color = '#dc3545';
            } else if (error == 'too_short_username') {
                document.getElementById('welcome').innerHTML = 'Too Short Username';
                document.getElementById('welcome').style.color = '#dc3545';
            } else if (error == 'too_long_password') {
                document.getElementById('welcome').innerHTML = 'Too Long Password';
                document.getElementById('welcome').style.color = '#dc3545';
            } else if (error == 'too_short_password') {
                document.getElementById('welcome').innerHTML = 'Too Short Password';
                document.getElementById('welcome').style.color = '#dc3545';
            } else if (error == 'username_exists') {
                document.getElementById('welcome').innerHTML= 'Username Exists';
                document.getElementById('welcome').style.color = '#dc3545';
            } else if (error == 'success') {
                window.location.replace('/');
            }
        }
    );
});
document.getElementById('password').addEventListener('mouseover', () => {
    document.getElementById('password').type = 'text'
});
document.getElementById('password').addEventListener('mouseout', () => {
    document.getElementById('password').type = 'password'
});