var UserEditFrom = function(request){
    if(request) {
        this.username = request.body["username"];
        this.password = request.body["password"];
        this.password_repeat = request.body["password_repeat"];
        this.f_name = request.body["f_name"];
        this.m_name = request.body["m_name"];
        this.l_name = request.body["l_name"];
        this.email = request.body["email"];
        this.phone = request.body["phone"];
        this.created = request.body["created"];
        this.last_login = request.body["last_login"];
        this.is_active = request.body["is_active"];
        this.is_superuser = request.body["is_superuser"];
    } else {
        this.username = "";
        this.password = "";
        this.password_repeat = "";
        this.f_name  = "";
        this.m_name  = "";
        this.l_name  = "";
        this.email  = "";
        this.phone  = "";
        this.created = new Date();
        this.last_login = null;
        this.is_active = false;
        this.is_superuser = false;
    }
};

UserEditFrom.prototype.is_valid = function() {
    var err = {length:0};
    if(!this.username || this.username.trim().length === 0) {
        err.username = "логин пользователя не заполнен";
        err.length++;
    }
    if(!this.password || this.password.trim().length === 0) {
        err.password = "пароль не заполнен";
        err.length++;
    }
    if(this.password !== this.password_repeat) {
        err.password_repeat = "не совпадают пароль и повтор пароля";
        err.length++;
    }
    if(!this.f_name || this.f_name.trim().length === 0) {
        err.f_name = "имя не заполнено";
        err.length++;
    }
    if(!this.m_name || this.m_name.trim().length === 0) {
        err.m_name = "отчество не заполнено";
        err.length++;
    }
    if(!this.l_name || this.l_name.trim().length === 0) {
        err.l_name = "фамилия не заполнена";
        err.length++;
    }
    if(!this.email || this.email.trim().length === 0) {
        err.email = "почта не указана";
        err.length++;
    }
    if(!this.phone || this.phone.trim().length === 0) {
        err.phone = "телефон не указан";
        err.length++;
    }
    if(err.length === 0)
        return null;
    else 
        return err;
};



if(typeof(module) !== 'undefined' && module !== null) {
    module.exports = UserEditFrom;
}