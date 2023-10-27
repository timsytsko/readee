from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify
from flask_sqlalchemy import SQLAlchemy
import random
from googletrans import Translator

app = Flask(__name__)
db_name = 'database.db'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_name
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(15), nullable=False)
    password = db.Column(db.String(30), nullable=False)
    books = db.Column(db.String(30), nullable=True)

    def __repr__(self):
        return '<User %r>' % self.id

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    session_key = db.Column(db.String(15), nullable=False)

    def __repr__(self):
        return '<Session %r>' % self.id

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    title = db.Column(db.String(50), nullable=False)
    author = db.Column(db.String(50), nullable=False)
    content = db.Column(db.String(500000), nullable=False)
    file_extension = db.Column(db.String(50))

    def __repr__(self):
        return '<Book %r>' % self.id

def _check_session_key(data):
    user = User.query.filter_by(username=data['username']).first()
    if user is None:
        return False
    else:
        session = Session.query.filter_by(user_id=user.id).first()
        if session.session_key == data['session_key']:
            return True
        else:
            return False

@app.route('/add_user', methods=['POST'])
def add_user():
    def check_data(data):
        if len(data['name']) > 50:
            return 'too_long_name'
        if len(data['name']) < 1:
            return 'too_short_name'
        if len(data['username']) > 15:
            return 'too_long_username'
        if len(data['username']) < 3:
            return 'too_short_username'
        if len(data['password']) > 30:
            return 'too_long_password'
        if len(data['password']) < 5:
            return 'too_short_password'
        if not (User.query.filter_by(username=data['username']).first() is None):
            return 'username_exists'
        return 'success'
    rec_data = request.json
    error = check_data(rec_data)
    if error == 'success':
        user = User(name=rec_data['name'],
                            username=rec_data['username'],
                            password=rec_data['password'],
                            books='')
        db.session.add(user)
        db.session.commit()
    data = {
        'error': error
    }
    return jsonify(data)

@app.route('/login_user', methods=['POST'])
def login_user():
    def check_data(data):
        user = User.query.filter_by(username=data['username']).first()
        if user is None:
            return 'unknown_username'
        if user.password != data['password']:
            return 'incorrect_password'
        return 'success'
    def generate_session_key():
        res = ''
        chars = [chr(i) for i in range(33, 127)]
        for _ in range(15):
            res += chars[random.randint(0, len(chars) - 1)]
        return res
    rec_data = request.json
    error = check_data(rec_data)
    data = {
        'error': error
    }
    if error == 'success':
        session_key = generate_session_key()
        data['session_key'] = session_key
        user = User.query.filter_by(username=rec_data['username']).first()
        session = Session.query.filter_by(user_id=user.id).first()
        if session is None:
            session = Session(user_id=user.id,
                            session_key=session_key)
            db.session.add(session)
        else:
            session.session_key = session_key
        db.session.commit()
    return jsonify(data)

@app.route('/check_session_key', methods=['POST'])
def check_session_key():
    rec_data = request.json
    user = User.query.filter_by(username=rec_data['username']).first()
    data = {}
    if user is None:
        data['error'] = 'unknown_username'
    else:
        session = Session.query.filter_by(user_id=user.id).first()
        if session.session_key == rec_data['session_key']:
            data['error'] = 'success'
        else:
            data['error'] = 'incorrect_session_key'
    return jsonify(data)

@app.route('/get_name_by_username', methods=['POST'])
def get_name_by_username():
    rec_data = request.json
    data = {}
    if _check_session_key(rec_data):
        user = User.query.filter_by(username=rec_data['username']).first()
        data['error'] = 'success'
        data['name'] = user.name
    else:
        data['error'] = 'incorrect_session_key'
        data['name'] = 'None'
    return jsonify(data)

@app.route('/change_name', methods=['POST'])
def change_name():
    rec_data = request.json
    data = {}
    print(rec_data)
    if _check_session_key(rec_data):
        user = User.query.filter_by(username=rec_data['username']).first()
        user.name = rec_data['new_name']
        db.session.commit()
        data['error'] = 'success'
    else:
        data['error'] = 'incorrect_session_key'
    return jsonify(data)

@app.route('/change_username', methods=['POST'])
def change_username():
    rec_data = request.json
    data = {}
    if _check_session_key(rec_data):
        user = User.query.filter_by(username=rec_data['username']).first()
        user.username = rec_data['new_username']
        db.session.commit()
        data['error'] = 'success'
    else:
        data['error'] = 'incorrect_session_key'
    return jsonify(data)

@app.route('/add_new_book', methods=['POST'])
def add_new_book():
    try:
        title = request.form['title']
        author = request.form['author']
        file = request.files['file']
        file_exension = file.filename.split('.')[-1]
        username = request.form['username']
        session_key = request.form['session_key']
        if not _check_session_key({'username': username, 'session_key': session_key}):
            return jsonify({'error': 'incorrect_session_key'})
        if title == '':
            return jsonify({'error': 'empty_title'})
        if len(title) > 20:
            return jsonify({'error': 'too_long_title'})
        if author == '':
            return jsonify({'error': 'empty_author'})
        if len(author) > 20:
            return jsonify({'error': 'too_long_author'})
        if file.filename.split('.')[-1] != 'txt':
            return jsonify({'error': 'incorrect_file_extension'})
        content = file.stream.read()[:]
        charsets = ['utf-8', 'cp1252']
        
        for cs in charsets:
            try:
                content = content.decode(cs)
                break
            except Exception as e:
                print(e)
        # try:
        #     content = file.stream.read().decode('utf-8')
        # except:
        #     content = file.stream.read().decode('cp1252')
        # try:
        #     content = file.stream.read().decode('cp1252')
        # except:
        #     content = file.stream.read().decode('utf-8')
        if len(content) > 500000:
            print(len(content))
            return jsonify({'error': 'too_big_file'})
        book = Book(user_id=User.query.filter_by(username=username).first().id,
                    title=title, author=author, content=content, file_extension=file_exension)
        db.session.add(book)
        User.query.filter_by(username=username).first().books =\
        User.query.filter_by(username=username).first().books + str(book.id) + ' '
        db.session.commit()
        return jsonify({'error': 'success'})
    except Exception as error:
        print(error)
        return jsonify({'error': 'cannot_read_file_content'})

@app.route('/get_books_by_user', methods=['POST'])
def get_books_by_user():
    rec_data = request.json
    data = {}
    if _check_session_key(rec_data):
        user = User.query.filter_by(username=rec_data['username']).first()
        data['books'] = user.books.split()
        data['error'] = 'success'
    else:
        data['error'] = 'incorrect_session_key'
    return jsonify(data)

@app.route('/get_book_titles', methods=['POST'])
def get_book_titles():
    rec_data = request.json
    data = {}
    if _check_session_key(rec_data):
        book = Book.query.filter_by(id=rec_data['id']).first()
        data['title'] = book.title
        data['author'] = book.author
        data['error'] = 'success'
    else:
        data['error'] = 'incorrect_session_key'
    return jsonify(data)

@app.route('/get_book_info', methods=['POST'])
def get_book_info():
    rec_data = request.json
    data = {}
    if _check_session_key(rec_data):
        book = Book.query.filter_by(id=rec_data['id']).first()
        data['user_id'] = book.user_id
        data['title'] = book.title
        data['author'] = book.author
        data['content'] = book.content
        data['file_extension'] = book.file_extension
        data['error'] = 'success'
    else:
        data['error'] = 'incorrect_session_key'
    return jsonify(data)

@app.route('/get_translation', methods=['POST'])
def get_translation():
    rec_data = request.json
    data = {}
    if _check_session_key(rec_data):
        if rec_data['src'] == 'not-chosen':
            data['error'] = 'src_lang_not_specified'
        elif rec_data['dest'] == 'not-chosen':
            data['error'] = 'dest_lang_not_specified'
        else:
            translator = Translator()
            translation = translator.translate(text=rec_data['text'],
                                                src=rec_data['src'],
                                                dest=rec_data['dest'])
            data['translation'] = translation.extra_data
            data['best_translation'] = translation.text
            data['error'] = 'success'
    else:
        data['error'] = 'incorrect_session_key'
    return jsonify(data)

@app.route('/')
def page_home():
    return render_template('home.html')

@app.route('/login')
def page_login():
    return render_template('login.html')

@app.route('/register')
def page_register():
    return render_template('register.html')

@app.route('/profile')
def page_profile():
    return render_template('profile.html')

@app.route('/add_book')
def page_add_book():
    return render_template('add_book.html')

@app.route('/my_books')
def page_my_books():
    return render_template('my_books.html')

@app.route('/book')
def book():
    return render_template('book.html')

@app.route('/book_settings')
def book_settings():
    return render_template('book_settings.html')

@app.errorhandler(404)
def page_404(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)
