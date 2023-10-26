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

if (getCookie('session_key') != 'no_cookie') {
    document.getElementById('nav-ul').innerHTML = `
    <li class="nav-item"><a href="/my_books" class="nav-link"><p class="header-nav">My Books</p></a></li>
    <li class="nav-item"><a href="/add_book" class="nav-link"><p class="header-nav">Add Book</p></a></li>
    <li class="nav-item"><a href="/profile" class="nav-link"><p class="header-nav">Profile</p></a></li>
    `;
}

send_xhr('POST', '/check_session_key',
    {
        'username': getCookie('username'),
        'session_key': getCookie('session_key')
    },
    function(rec_data) {
        console.log(rec_data.error);
        if (rec_data.error != 'success') {
            document.cookie = 'username=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
            document.cookie = 'session_key=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
            window.location.replace('/login');
        }
    }
);

document.getElementById('add-book-card').
addEventListener('submit', function (event) {
    event.preventDefault();
    let local_xhr = new XMLHttpRequest();
    local_xhr.responseType = "json";
    local_xhr.open('post', '/add_new_book', true);
    local_xhr.onload = () => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('add-book-card').style.display = 'block';
        let rec_data = local_xhr.response;
        console.log(rec_data.error);
        if (rec_data.error == 'success') {
            window.location.replace('/');
        } else if (rec_data.error == 'empty_title') {
            document.getElementById('p-title').style.color = '#dc3545';
        } else if (rec_data.error == 'too_long_title') {
            document.getElementById('p-title').style.color = '#dc3545';
            document.getElementById('p-title').innerHTML = 'Too long title:';
        } else if (rec_data.error == 'empty_author') {
            document.getElementById('p-author').style.color = '#dc3545';
        } else if (rec_data.error == 'too_long_author') {
            document.getElementById('p-author').style.color = '#dc3545';
            document.getElementById('p-author').innerHTML = 'Too long title:';
        } else if (rec_data.error == 'incorrect_file_extension') {
            document.getElementById('p-content').style.color = '#dc3545';
            document.getElementById('p-content').innerHTML = 'Incorrect file extension:';
        }
    }
    let formData = new FormData(document.getElementById('add-book-card'));
    formData.append('username', getCookie('username'));
    formData.append('session_key', getCookie('session_key'));
    document.getElementById('loading').style.display = 'block';
    document.getElementById('add-book-card').style.display = 'none';
    local_xhr.send(formData);
});