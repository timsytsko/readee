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

let book_data;
let book_content;
let words_in_page = 350;

function draw_book() {
    rec_data = book_data;
    document.getElementById('name-author').innerHTML = `
        <p>${rec_data.title}, ${rec_data.author}</p>
    `;
    let content = book_content.slice();
    document.getElementById('pages-in-total').innerHTML = Math.ceil(content.length / words_in_page);
    document.getElementById('book-text').innerHTML = '';
    document.getElementById('book-text').innerHTML += `
        <p id="p-book-text"></p>
    `;
    let current_page = Number(document.getElementById('page-current').innerHTML);
    let upper_border = current_page * words_in_page;
    if (upper_border > content.length) {
        upper_border = content.length;
    }
    content = content.slice((current_page - 1) * words_in_page, upper_border);
    for (let i = 0; i < content.length; i++) {
        if (content[i] == '\n') {
            document.getElementById('p-book-text').innerHTML += `
                <span class="word" id="word-${i}"><br></span>
            `;
        } else {
            document.getElementById('p-book-text').innerHTML += `
                <span class="word" id="word-${i}">${content[i]}</span>
            `;
        }
    }
    for (let i = 0; i < content.length; i++) {
        document.getElementById(`word-${i}`).
        addEventListener('click', () => {
            let word = document.getElementById(`word-${i}`).innerHTML;
            let unwanted_characters = ['.', ',', '"', '?', '!', '¿', '¡', ':', ';', '(', ')'];
            for (let i = 0; i < word.length; i++) {
                for (let j of unwanted_characters) {
                    word = word.replace(j, '');
                }
            }
            send_xhr('POST', '/get_translation',
                {
                    'username': getCookie('username'),
                    'session_key': getCookie('session_key'),
                    'text': word,
                    'src': document.getElementById('select-src').value,
                    'dest': document.getElementById('select-dest').value
                },
                function(rec_data) {
                    if (rec_data.error == 'incorrect_session_key') {
                        document.cookie = 'username=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
                        document.cookie = 'session_key=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
                        window.location.replace('/login');
                    } else if (rec_data.error == 'src_lang_not_specified') {
                        document.getElementById('select-src').
                        style.borderColor = 'red';
                    } else if (rec_data.error == 'dest_lang_not_specified') {
                        document.getElementById('select-dest').
                        style.borderColor = 'red';
                    } else {
                        document.getElementById('src-text').innerHTML = word;
                        document.getElementById('dest-text').
                        innerHTML = rec_data.best_translation;
                        let all_translations = rec_data.translation['all-translations'];
                        document.getElementById('extra-translations').innerHTML = '';
                        for (let i of all_translations) {
                            let add = `
                            <div class="part-of-speech">
                                <p class="part-name">${i[0]}</p>
                                <div class="part-name-translations">
                            `;
                            for (let j of i[1]) {
                                add += `<p class="part-nanme-translation">${j}</p>`
                            }
                            document.getElementById('extra-translations').
                            innerHTML += add;
                        }
                    }
                }
            );
        });
    }
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

if (getCookie('session_key') != 'no_cookie') {
    document.getElementById('nav-ul').innerHTML = `
    <li class="nav-item"><a href="/my_books" class="nav-link"><p class="header-nav">My Books</p></a></li>
    <li class="nav-item"><a href="/add_book" class="nav-link"><p class="header-nav">Add Book</p></a></li>
    <li class="nav-item"><a href="/profile" class="nav-link"><p class="header-nav">Profile</p></a></li>
    `
}

document.getElementById('translation-panel').
style.height = document.getElementById('book-text').style.height;

send_xhr('POST', '/get_book_info',
    {
        'username': getCookie('username'),
        'session_key': getCookie('session_key'),
        'id': get_get_parameter('id')
    },
    function(rec_data) {
        book_data = rec_data;
        let content = rec_data.content;
        for (let i of content) {
            content = content.replace('\r\n', ' \n ');
        }
        content = content.split(' ');
        book_content = content;
        draw_book();
    }
);

document.getElementById('select-src').
addEventListener('focus', () => {
    document.getElementById('select-src').style.borderColor = "#55595e";
});

document.getElementById('select-dest').
addEventListener('focus', () => {
    document.getElementById('select-dest').style.borderColor = "#55595e";
});

document.getElementById('page-prev').
addEventListener('click', () => {
    let cur_page = Number(document.getElementById('page-current').innerHTML);
    if (cur_page > 1) {
        document.getElementById('page-current').innerHTML = (cur_page - 1).toString();
        draw_book();
    }
});

document.getElementById('page-next').
addEventListener('click', () => {
    let cur_page = Number(document.getElementById('page-current').innerHTML);
    let max_page = Number(document.getElementById('pages-in-total').innerHTML);
    if (cur_page < max_page) {
        document.getElementById('page-current').innerHTML = (cur_page + 1).toString();
        draw_book();
    }
});

document.getElementById('btn-settings').
addEventListener('click', () => {
    window.location.replace(`/book_settings?id=${get_get_parameter('id')}`);
});
