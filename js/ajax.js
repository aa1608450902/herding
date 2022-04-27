let ajax = {
    obj: new XMLHttpRequest(),
    post: function(url, data, success, error) {
        let T = this.obj;
        T.open('POST', url, true);
        T.setRequestHeader("Content-Type", "application/json");
        T.send(JSON.stringify(data));
        T.onload = function() {
            if (T.status === 200 || T.status === 304) {
                if (success && success instanceof Function) {
                    success.call(T, T.responseText)
                } else {
                    console.error("No success handle function!");
                    alert("No success handle function!")
                }
            } else {
                error.call(T, T.responseText)
            }
        }
    },
    get: function(url, success, error) {
        let T = this.obj;
        T.open('GET', url, true);
        T.setRequestHeader("Content-Type", "application/json");
        T.send();
        T.onload = function() {
            if (T.status === 200 || T.status === 304) {
                if (success && success instanceof Function) {
                    success.call(T, T.responseText)
                } else {
                    console.error("No success handle function!");
                    alert("No success handle function!")
                }
            } else {
                error.call(T, T.responseText)
            }
        }
    }
};
