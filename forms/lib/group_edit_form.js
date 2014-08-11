var GroupEditForm = function(request){
    if(request) {
        this.name = request.body["name"];
    } else {
        this.name = "";
    }
};

GroupEditForm.prototype.is_valid = function() {
    var err = {length:0};
    if(!this.name || this.name.trim().length === 0) {
        err.name = "не указано название группы";
        err.length++;
    }
    
    if(err.length === 0)
        return null;
    else 
        return err;
};

GroupEditForm.prototype.insertTo = function(group) {
    group.name = this.name;
};

if(typeof(module) !== 'undefined' && module !== null) {
    module.exports = GroupEditForm;
}