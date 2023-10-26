function getCookie(name) {
    if (document.cookie.length > 0) {
        start = document.cookie.indexOf(name + "=");
        if (start != -1) {
            start = start + name.length + 1;
            end = document.cookie.indexOf(";", start);
            if (end == -1) {
                end = document.cookie.length;
            }
            return document.cookie.substring(start, end);
        }
    }
    return "no_cookie";
}

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

send_xhr('POST', '/check_session_key',
    {
        'username': getCookie('username'),
        'session_key': getCookie('session_key')
    },
    function(rec_data) {
        if (rec_data.error != 'success') {
            document.cookie = 'username=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
            document.cookie = 'session_key=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
            window.location.replace('/login');
        }
    }
);

if (getCookie('username') == 'no_cookie') {
    window.location.replace('/')
}

document.getElementById('nav-ul').innerHTML = `
<li class="nav-item"><a href="/my_books" class="nav-link"><p class="header-nav">My Books</p></a></li>
<li class="nav-item"><a href="/add_book" class="nav-link"><p class="header-nav">Add Book</p></a></li>
    <li class="nav-item"><a href="/profile" class="nav-link"><p class="header-nav">Profile</p></a></li>
`

send_xhr('POST', '/get_name_by_username',
    {
        'username': getCookie('username'),
        'session_key': getCookie('session_key')
    },
    function(rec_data) {
        if (rec_data.error == 'success') {
            document.getElementById('name').value = rec_data.name
        }
    }
);

document.getElementById('username').value = getCookie('username')

document.getElementById('btn-save-name').
addEventListener('click', () => {
    send_xhr('POST', '/change_name',
        {
            'username': getCookie('username'),
            'session_key': getCookie('session_key'),
            'new_name': document.getElementById('name').value
        },
        function(rec_data) {}
    );
    document.getElementById('name-saved').style.visibility = 'visible';
});

document.getElementById('name').
addEventListener('focus', () => {
    document.getElementById('name-saved').style.visibility = 'hidden';
});

document.getElementById('btn-save-username').
addEventListener('click', () => {
    send_xhr('POST', '/change_username',
        {
            'username': getCookie('username'),
            'session_key': getCookie('session_key'),
            'new_username': document.getElementById('username').value
        },
        function(rec_data) {}
    );
    document.cookie = "username=" +
                    document.getElementById('username').value +
                    ";path=/" + ";expires=Fri, 31 Dec 9999 23:59:59 GMT";
    document.getElementById('username-saved').style.visibility = 'visible';
});

document.getElementById('username').
addEventListener('focus', () => {
    document.getElementById('username-saved').style.visibility = 'hidden';
});

document.getElementById('btn-logout').
addEventListener('click', () => {
    document.cookie = 'username=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'session_key=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
    window.location.replace('/')
});
