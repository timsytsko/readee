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
        send_xhr('POST', '/login_user',
            {
                'username': document.getElementById('username').value,
                'password': document.getElementById('password').value
            },
            function(rec_data) {
                error = rec_data.error
                if (error == 'unknown_username') {
                    document.getElementById('welcome').innerHTML = 'Unknown Username';
                    document.getElementById('welcome').style.color = '#dc3545';
                } else if (error == 'incorrect_password'){
                    document.getElementById('welcome').innerHTML = 'Incorrect Password';
                    document.getElementById('welcome').style.color = '#dc3545';
                } else if (error == 'success') {
                    if (document.getElementById('remember-cb').checked) {
                        document.cookie = "session_key=" + rec_data.session_key +
                            ";path=/" + ";expires=Fri, 31 Dec 9999 23:59:59 GMT";
                        document.cookie = "username=" +
                            document.getElementById('username').value +
                            ";path=/" + ";expires=Fri, 31 Dec 9999 23:59:59 GMT";
                    } else {
                        document.cookie = "session_key=" + rec_data.session_key +
                            ";path=/";
                        document.cookie = "username=" +
                            document.getElementById('username').value +
                            ";path=/";
                    }
                    window.location.replace('/');
                }
            }
        )
    }
);

document.getElementById('password').addEventListener('mouseover', () => {
    document.getElementById('password').type = 'text'
});
document.getElementById('password').addEventListener('mouseout', () => {
    document.getElementById('password').type = 'password'
});
