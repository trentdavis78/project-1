var selection1 = "";
var selection2 = "";
var selection3 = "";
var lie;

var optionsarr1 = [
    "I'm a vegetarian",
    "I'm a vegan",
    "I've never been outside the US",
    "I like to go camping",
    "I enjoy anime",
    "I prefer movies over TV",
    "I like to play video games",
    "My favorite color is blue",
    "I like to build computers",
    "I enjoy running"
];

var optionsarr2 = [
    "I've been skydiving",
    "I live on my own",
    "I know how to drive a manual transmission",
    "I enjoy lifting weights",
    "I was born outside the US",
    "I like to go hunting",
    "I play World of Warcraft",
    "I like to go to bars",
    "I've never had an alcoholic drink",
    "I enjoy hiking"
];

var optionsarr3 = [
    "I enjoy Javascript more than HTML",
    "I'm more interested in front-end design than backend",
    "I prefer writing notes over typing them",
    "I can do my own vehicle maintanence",
    "I have a fear of water",
    "I wear glasses/contacts",
    "I prefer Marvel over DC",
    "I dislike horror movies",
    "I know how to ride a motorcycle"
];


function populateDropdown(){
    for (i = 0; i < optionsarr1.length; i++) {
        var a = $("<option value=" + "1-" + i + ">" + optionsarr1[i] + "</option>");
        $("#option1").append(a);

    //     if (selection1 == ""){
    //         selection1 = "1-0";
    //     }
     }
    for (i = 0; i < optionsarr1.length; i++) {
        var b = $("<option value=" + "2-" + i + ">" + optionsarr2[i] + "</option>");
        $("#option2").append(b);

        // if (selection2 == ""){
        //     selection2 = "2-0";
        // }
    }
    for (i = 0; i < optionsarr1.length; i++) {
        var c = $("<option value=" + "3-" + i + ">" + optionsarr3[i] + "</option>");
        $("#option3").append(c);

        // if (selection3 == ""){
        //     selection3 = "3-0";
        // }
    }
};

populateDropdown();

$("#option1").change(function(){
    selection1 = this.value;
    // console.log(this.value);
})

$("#option2").change(function(){
    selection2 = this.value;
    // console.log(this.value);
})

$("#option3").change(function(){
    selection3 = this.value;
    // console.log(this.value);
})


$("#input-submit").click(function(){ 
    if (selection1 == ""){
        selection1 = "1-0";
    }

    if (selection2 == ""){
        selection2 = "2-0";
    }

    if (selection3 == ""){
        selection3 = "3-0";
    }
    console.log(selection1);
    console.log(selection2);
    console.log(selection3);
});