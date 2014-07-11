(function() {
    module.exports = {
        /*
         * Переводит дату в виде числа ГГГГММДД в строку ГГГГ-ММ-ДД
         */
        uglyDateCorrect: function(date) {
            if (!date)
                return null;
            var res = date.toString();
            res = res.slice(0, 4) + '-' + res.slice(4, 6) + '-' + res.slice(6, 8);
            return res;
        },
        /*
         * Переводит дату в виде числа ГГГГММДД в строку 'ГГГГ-ММ-ДД',
         * если входное число не соответствует входным условиям, 
         * возвращается NULL
         */
        uglyDateToString: function(date) {
            var v = uglyDateCorrect(date);
            if (!v || v.length == 0)
                return null;
            else
                return "'" + v + "'";
        },
        /*
         * Переводит входное значение в строку для SQL запроса.
         * Если входное значение - число, то оставляем как есть.
         * Если - дата или строка, то оборачиваем в одинарные кавычки.
         * */
        fieldToString: function(val) {
            if (val == null || val == undefined)
                return null;
            else if (typeof (val) == 'object')
                return "'" + val.toISOString().slice(0, 10) + "'";
            else if (typeof (val) == 'number')
                return val;
            else
                return "'" + val + "'";
        }
    };
}).call(this);
