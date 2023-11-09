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

function get_get_parameter(parameterName) {
    let result = null,
    tmp = [];
    location.search
            .substr(1)
            .split("&")
            .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
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
`;

send_xhr('POST', '/get_book_titles',
    {
        'username': getCookie('username'),
        'session_key': getCookie('session_key'),
        'id': get_get_parameter('id')
    },
    function(rec_data) {
        document.getElementById('name').value = rec_data.title;
        document.getElementById('author').value = rec_data.author;
    }
);
