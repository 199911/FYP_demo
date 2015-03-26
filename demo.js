var initCode = {
    
    "ace/mode/c_cpp" :    
    "#include <stdio.h>\n" +
    "int main() {\n" +
    "\tprintf(\"hello world!\\n\");\n" +
    "\treturn 0;" +
    "}\n",

    "ace/mode/python" :
    "print \"Hello World!\"\n",

    "ace/mode/ruby" :
    "p 'hello'",

    "ace/mode/javascript" :
    "console.log('HelloWorld!');"
};

var state = {
    "user" : "fyp_demo",
    "mode" : "code",
    "language" : "C",
    "code" : initCode["ace/mode/c_cpp"],
    "stdin" : "",
    "stdout" : "",
    "stderr" : "",
    "msg" : ""
}

$(function(){

    editor = ace.edit("editor_main");
    editor.setTheme("ace/theme/chrome");
    editor.getSession().setMode("ace/mode/c_cpp");
    editor.getSession().setTabSize(2);
    editor.setValue(initCode["ace/mode/c_cpp"]);

    $( "#languageMenu" ).click(function(event) {
        var languageMode = event.target.getAttribute("value");
        editor.getSession().setMode(languageMode);
        editor.setValue(initCode[languageMode], 1);
        state["code"] = initCode[languageMode];
        switch(languageMode){
            case "ace/mode/c_cpp":
                state["language"] = "c"; 
            break;
            case "ace/mode/python":
                state["language"] = "python"; 
            break;
            case "ace/mode/ruby":
                state["language"] = "ruby"; 
            break;
            case "ace/mode/javascript":
                state["language"] = "javascript"; 
            break;
        }
        $( "#code" ).trigger("click");
        $( "#language" ).text(state["language"]);
    });


    $( "#code" ).click(function(event) {
        state[state["mode"]] = editor.getSession().getValue();
        state["mode"] = "code"
        editor.setReadOnly(false);
        editor.setValue(state[state["mode"]], 1);
    });
    $( "#stdin" ).click(function(event) {
        state[state["mode"]] = editor.getSession().getValue();
        state["mode"] = "stdin"
        editor.setReadOnly(false);
        editor.setValue(state[state["mode"]], 1);
    });
    $( "#stdout" ).click(function(event) {
        state[state["mode"]] = editor.getSession().getValue();
        state["mode"] = "stdout"
        editor.setReadOnly(true);
        editor.setValue(state[state["mode"]], 1);
    });
    $( "#stderr" ).click(function(event) {
        state[state["mode"]] = editor.getSession().getValue();
        state["mode"] = "stderr"
        editor.setReadOnly(true);
        editor.setValue(state[state["mode"]], 1);
    });
    $( "#msg" ).click(function(event) {
        state[state["mode"]] = editor.getSession().getValue();
        state["mode"] = "msg"
        editor.setReadOnly(true);
        editor.setValue(state[state["mode"]], 1);
    });

    $( "#submitButton" ).click(function(event) {
        if (state["mode"] == "code"){
            state["code"] = editor.getSession().getValue(); 
        }else if (state["mode"] == "stdin"){
            state["stdin"] = editor.getSession().getValue(); 
        }
        socket.emit('sandbox', state);
        // diable the button
        $( "#submitButton" ).html("Running");
        $('#submitButton').prop('disabled', true);
    });

    socket = io("http://www.kingdommole.com:40200");
    socket.on('result', function(msg){
        console.log(msg);
        
        $( "#submitButton" ).html("Submit");
        $( "#submitButton" ).prop('disabled', false);

        state["stdout"] = msg.stdout;
        state["stderr"] = msg.stderr;
        state["msg"] = "";
        
        // trigger tags
        if(msg.compile_message){
            state["msg"] = msg.compile_message;
            $( "#msg" ).trigger("click");
        } else if(msg.stderr && msg.stderr.length > 0){
            $( "#stderr" ).trigger("click");
        }else{
            $( "#stdout" ).trigger("click");
        }

        // change message
        $( "#state" ).removeClass("label-primary");
        $( "#state" ).removeClass("label-success");
        $( "#state" ).removeClass("label-info");
        $( "#state" ).removeClass("label-warning");
        $( "#state" ).removeClass("label-danger");
        
        switch (msg.compile_status){
            case "Success" :
                switch (msg.process_status){
                    case "OK" :
                        $( "#state" ).text("Success");
                        $( "#state" ).addClass("label-success");
                    break;
                    default:
                        $( "#state" ).text(msg.process_status);
                        $( "#state" ).addClass("label-warning");
                };
            break;
            case "Compile Error":
                $( "#state" ).text("Compile Error");
                $( "#state" ).addClass("label-danger");
            break;
            default:
                console.log(msg.compile_status);
        }
    });
});