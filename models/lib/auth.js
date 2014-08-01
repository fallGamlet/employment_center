/**
 * Auth models
 * @param {Object} db - объект подключения к базе данных библиотеки ORM
 * @param {Function} callback - функция обратного ввызова
 */
module.exports = function (db, callback) {
    /**
     * Model ContentTable - содержит наименования таблиц в БД
     */
    var ContentTable = db.define("content_table", {
		name: String
	});
    /**
     * 
     * Model Access - указывает возможные уровни доступа к контенту
     * read, add, delete, change
     */
    var Access = db.define("auth_access", {
        name: String,
        description: String
    });
    /**
     * Model Permission - содержит 
     */
    var Permission = db.define("auth_permission", {});
    Permission.hasOne("contenttable", ContentTable, {field:"contenttable_id", reverse: "permissions", key:true});
    Permission.hasOne("access", Access, {field:"access_id", reverse: "permissions", key:true});
    /**
     * Model Group - содержит наименования групп пользователей
     */
    var Group = db.define("auth_group", {
		name: String
	});
    // привилегии, дающиеся группе
    Group.hasMany('permissions', 
                    Permission, {}, 
                    { mergeTable:"auth_group_permission",
                      mergeId:"group_id", 
                      mergeAssocId:"permission_id", 
                      reverse: 'groups', 
                      key: true
                    });
    /*
     * Model User - содержит информацию о пользователях
     */
    var User = db.define('auth_user', {
    	username: String,
    	password: String,
    	f_name : String,
    	m_name : String,
    	l_name : String,
    	email : String,
        phone : String,
        created: Date,
        last_login: Date,
        is_active: Boolean,
        is_superuser: Boolean
    });
    // отношения пользователя к различным группам
    User.hasMany('groups', 
                Group, {}, 
                { mergeTable:"auth_user_group",
                  mergeId:"user_id",
                  mergeAssocId:"group_id",
                  reverse: 'users', 
                  key: true
                });
    // привилегии, дающиеся пользователю
    User.hasMany('permissions', 
                Permission, {}, 
                { mergeTable:"auth_user_permission",
                  mergeId:"user_id",
                  mergeAssocId:"permission_id",
                  reverse: 'users', 
                  key: true
                });
    
    if(typeof(callback) === "function")
    	return callback();
};