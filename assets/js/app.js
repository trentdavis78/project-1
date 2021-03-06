
// start particles.js
particlesJS.load('particles-js', 'assets/js/particles.json');
function initAll() {
    $("#adminHome").show();
    $("#addNewGroupUsers").hide();
    $("#loremSelectedUsers").hide();
    $("#addGroupActivity").hide();
    $("#userGroupSelect").hide();
    $("#userActivitySelect").hide();
    $("#newGroupNameError").hide();
    $("#userLogin").hide();
    $("#resultsScorecard").hide();
    $("#backToAdminPanel").hide();

}
initAll();
var path = window.location.pathname;
var page = path.split("/").pop();

var db = firebase.database();
$(document).ready(function () {

    setUsersFromCookies();
    // add new group modal functions 
    $("#submitNewGroupName").on("click", function () {
        // add new group validation
        var value = $("#newGroupName").val().trim();
        if (value == "") {
            $("#newGroupNameError").show();
            // else grab values and fire db function - hide/show necessary sections
        } else {
            var newGroupName = $("#newGroupName").val();
            var newGroupNameShortDesc = $("#newGroupNameShortDesc").val();
            var newGroupNameLongDesc = $("#newGroupNameLongDesc").val();
            var uid = user.userAuthId;
            saveGroupToDB(newGroupName, newGroupNameShortDesc, newGroupNameLongDesc, uid);
            $("#addGroupModal").modal('hide');
        }
    });
    function saveGroupToDB(name, shortDesc, longDesc, uid) {
        var myRef = db.ref().push();
        var key = myRef.key;
        var data = {
            group_id: key,
            group_short_desc: shortDesc,
            group_long_desc: longDesc,
            createdBy: uid,
            created: firebase.database.ServerValue.TIMESTAMP
        };
        db.ref('groups').child(name).set(data)
            .then(function (snap) {
                console.log("Success!");
            }, function (err) {
                console.log(err + " error");
            });
    }
    // populate My Groups on admin page with groups created by user.uid    
    function populateMyGroups(admin) {

        db.ref('groups').orderByChild('createdBy').equalTo(admin).on("value", function (snap) {
            $("#myGroups").empty();
            snap.forEach(function (data) {
                var newDiv = $("<div>");
                newDiv.addClass("admin-group");
                newDiv.attr("id", data.val().group_id);
                newDiv.html("<span>" + data.key + "</span>");
                $("#myGroups").append(newDiv);
            });
        });
    }
    //calling Get Groups from Firebase
    getGroups();
    // populateMyGroups(user.userAuthId);
    populateMyGroups("trentdavisinc@gmail.com");
    function clearFirebaseDataHTML() {
        $("#showGroupModalTitle").empty();
        $("#addGroupActivityTitle").empty();
        $("#showGroupCreatedBy").empty();
        $("#showGroupShortDesc").empty();
        $("#addGroupActivityShortDesc").empty();
        $("#showGroupLongDesc").empty();
        $("#adminActivitiesScheduled").empty();
        $("#addNewGroupActivity").attr("data-group-id", "");
        $("#showGroupResults").attr("data-group-id", "");
        $("adminShowResults").empty();
    }
    // show My Group info and Add Activity/See Results
    $(document).on("click", ".admin-group", function () {
        clearFirebaseDataHTML();
        var group_id = $(this).attr("id");
        db.ref('groups').orderByChild('group_id').equalTo(group_id).on("value", function (snap) {
            snap.forEach(function (child) {
                var name = child.key;
                var cv = child.val();
                $("#showGroupModalTitle").text(name);
                $("#addGroupActivityTitle").text(name);
                $("#showGroupCreatedBy").text(cv.createdBy);

                var createdOn = moment(cv.created).format("MMMM Do YYYY, hh:mm:ss a");
                $("#showGroupCreatedOn").text(createdOn);

                $("#showGroupShortDesc").text(cv.group_short_desc);
                $("#addGroupActivityShortDesc").text(cv.group_short_desc);
                $("#showGroupLongDesc").text(cv.group_long_desc);
                if (child.hasChild('activities')) {
                    child.child('activities').forEach(function (children) {
                        var activity_id = children.val().activity_id;
                        db.ref('activities').orderByChild('activity_id').equalTo(activity_id).on("child_added", function (snap) {
                            $("#adminActivitiesScheduled").append("<li>" + snap.key + "</li>");
                        });
                    });
                } else {
                    $("#adminActivitiesScheduled").html("<li>You do not have any activities scheduled</li>");
                }
                $("#addNewGroupActivity").attr("data-group-id", cv.group_id);
                $("#showGroupResults").attr("data-group-id", cv.group_id);
            });
        });
        db.ref('results').orderByChild('group_id').equalTo(group_id).once("value", function (snap) {
            if (snap.val()) {
                var qtyPend = 0;
                var qtyIP = 0;
                var qtyComp = 0;
                var html = "";
                snap.forEach(function (snap) {
                    if (snap.val().status == "pending") {
                        qtyPend++;
                    } else if (snap.val().status == "in progress") {
                        qtyIP++;
                    } else if (snap.val().status == "complete") {
                        qtyComp++;
                    }
                });
                if (qtyPend > 0) {
                    html += "<li>" + qtyPend + " Pending</li>";
                }
                if (qtyIP > 0) {
                    html += "<li>" + qtyIP + " In Progress</li>";
                }
                if (qtyComp > 0) {
                    html += "<li>" + qtyComp + " Complete</li>";
                }
                $("#adminShowResults").html(html);
                $("#showGroupResults").removeClass("disabled");
            } else {
                $("#adminShowResults").html("<li>You do not have any results to display</li>");
                $("#showGroupResults").addClass("disabled");
            }

        });
        $("#showGroupModal").modal('show');
    });
    // show Add New Group Activity section
    $("#addNewGroupActivity").on("click", function () {
        $("#adminHome").hide();
        $("#addGroupActivity").show();
        $("#backToAdminPanel").show();
        var dataGroupID = $(this).attr("data-group-id");
        db.ref('activities').on("value", function (snap) {
            $("#addActivityRow").empty();
            snap.forEach(function (data) {
                var dv = data.val();
                var html = "<div class='card-body'>";
                html += "<div class='card border-dark mb-3' style='max-width: 18rem;'>";
                html += "<div class='card-header'>" + data.key + "</div>";
                html += "<div class='card-body'>";
                html += "<p class='card-text'>" + dv.activity_desc + "</p>";
                html += "<button data-group-id='" + dataGroupID + "' data-activity-id='" + dv.activity_id + "'";
                html += "data-activity-name='" + data.key + "' data-activity-desc='" + dv.activity_desc + "'";
                html += "id='addThisActivity' class='btn btn-theme activity-btn'>Add to  Group</button>";
                html += "</div></div></div>";
                $("#addActivityRow").append(html);

            });
        });
    });
    // hide Add New Group Activity when 'Back to admin panel' is clicked
    $("#backToAdminPanel").on("click", function () {
        $("#addGroupActivity").hide();
        $("#resultsScorecard").hide();
        $("#adminHome").show();
        $("#backToAdminPanel").hide();
    });

    // Show cofirm add activity modal on click
    $(document).on("click", ".activity-btn", function () {
        $('#confirmAddActivityModal').modal('show');
        var groupID = $(this).attr("data-group-id");
        var activityID = $(this).attr("data-activity-id");
        var activityName = $(this).attr("data-activity-name");
        var activityDesc = $(this).attr("data-activity-desc");
        $("#confirmAddActivityName").text(activityName);
        $("#confirmAddActivityDesc").text(activityDesc);
        $("#confirmAddActivityBtn").attr("data-group-id", groupID);
        $("#confirmAddActivityBtn").attr("data-activity-id", activityID);
    });

    // Add confirm add activity to Firebase
    $("#confirmAddActivityBtn").on("click", function () {
        var groupID = $(this).attr("data-group-id");
        var activityID = $(this).attr("data-activity-id");
        var query = db.ref('groups').orderByChild('group_id').equalTo(groupID);
        query.on("child_added", function (snapshot) {
            snapshot.ref.child('activities').push({ activity_id: activityID });
        });
        createResultsSet(groupID, activityID);
        $("#adminHome").show();
        $("#addGroupActivity").hide();
        $("#confirmAddActivityModal").modal("hide");
    });
    // Show Results Scorecard
    $("#showGroupResults").on("click", function () {
        $("#resultsScorecard").show();
        $("#adminHome").hide();
        $("#showGroupModal").modal('hide');
        $("#backToAdminPanel").show();
        var dataGroupID = $(this).attr("data-group-id")
        printResultsToHTML(dataGroupID);
    });

    // Group selection 
    $(document).on("click", ".user-group", function () {
        var groupId = $(this).attr("data-group-id");
        var groupActivites = [];
        //setUsersFromCookies();
        setUsersFromCookies();
        var datapath = "groupUsers/" + user.userKey + "/groupId";
        //var datapath = "groupUsers/" + user.displayName + "/groupId";

        db.ref(datapath).set(groupId)
            .then(function (snap) {
                console.log("Success!");
                $("#userGroupSelect").hide();
                $("#userActivitySelect").show();
                Cookies.set("userStatus","groupSelected");
                //window.location.href=""
            }, function (err) {
                console.log(err + " error");
            });

            db.ref('groups').orderByChild('group_id').equalTo(groupId).once("value", function (snap) {
                snap.forEach(function(groupSnap){      
                   var groupName = groupSnap.key;        
                    var obj = groupSnap.val().activities;
                    var result = Object.keys(obj).map(function(key) {
                    return [Number(key), obj[key]];
                    });
                    for(i=0; i<result.length; i++){
                        groupActivites.push(result[i][1].activity_id);                       
                       
                    }
                    printUserGroupActivities(groupActivites, groupName);
              
                });
             });
             $("#userGroupSelect").hide();
             $("#userActivitySelect").show();

    });
    function printUserGroupActivities(groupActivites, groupName){        
        var html = "";
        for(i=0; i<groupActivites.length;i++){
            var activityID = groupActivites[i];
            db.ref('activities').orderByChild('activity_id').equalTo(groupActivites[i]).once("child_added", function (snap) {
            html += "<div class='card-body user-activity-card-body mt-3'>";
            html += "<div class='card border-dark mb-3'>";
            html += "<div class='card-header'>" + snap.key + "</div>";
            html += "<div class='card-body user-activity-card-body'>";
            html += "<p>" + snap.val().activity_desc + "</p>";
            if(snap.val().activity_url == "index.html"){
                html += "<button data-group-name='" + groupName + "' id='" + activityID + "' data-activity-url='" + snap.val().activity_url + "' class='startThisActivity btn btn-theme activity-btn disabled'>Start</button>";
            } else {
                html += "<button data-group-name='" + groupName + "' id='" + activityID + "'  data-activity-url='" + snap.val().activity_url + "' class='startThisActivity btn btn-theme activity-btn'>Start</button>";
            }           
            html += "</div></div></div>";   
            $("#myGroupActivities").empty();     
            $("#myGroupActivities").prepend(html);        
            });
        }        
    }
    //Add User specific true/Lies
    $(document).on("click", ".startThisActivity", function () {
      $("#myGroupActivities").empty();
      $("#myGroupActivities").html("<div class='mt-5'><div class='outerCircle'></div><div class='innerCircle'></div><div class='icon'></div></div>");  
      var groupName = $(this).attr("data-group-name");
      var activityID = $(this).attr("id");
      var activityURL = $(this).attr("data-activity-url");
      var resultKey;  
      db.ref('groups/' + groupName).child('group_id').on("value", function(snap){
          var groupID = snap.val();
          db.ref('results').orderByChild('group_id').equalTo(groupID).on("value", function(resultSnap){
            resultSnap.forEach(function(activitySnap){
                if(activitySnap.val().activity_id === activityID) {
                    resultKey = activitySnap.key;
                }
            }); 
          });
      });
      setTimeout(function(){ 
        db.ref('results/' + resultKey + "/users").transaction(function(userCount) {
            return userCount + 1;
          });
          db.ref('results/' + resultKey).update({status: "in progress"});
          window.location.href = activityURL;
       }, 1000);
       

    });

    // function to obtain the newly created activity push key and insert it into the 'results' table for relational purposes
    function createResultsSet(groupID, activityID) {
        var query = db.ref('groups').orderByChild('group_id').equalTo(groupID);
        query.once("value", function (snapshot) {
            snapshot.forEach(function (groupSnapshot) {
                groupSnapshot.child("activities").forEach(function (activitySnapshot) {
                    if (activitySnapshot.val().activity_id == activityID) {
                        db.ref('results').push({
                            group_id: groupID,
                            activity_id: activityID,
                            activity_key: activitySnapshot.key,
                            users: 1,
                            status: "pending",
                            created: firebase.database.ServerValue.TIMESTAMP
                        });
                    }
                });
            });
        });
    }
    // print results page to HTML
    function printResultsToHTML(groupID) {
        var rkey1 = "team-building", rkey2 = "bars", rkey3 ="restaurants";
        $(".result-nav-link").empty();
        $("#resultTab").empty();
        $(".result-nav-link").removeClass("active");
        $("#resultTabContent").empty();
        $(".tab-pane").removeClass("show active");
        var i = 0;
        db.ref('results').orderByChild('group_id').equalTo(groupID).once("value", function (snap) {
            snap.forEach(function (child) {
                var cv = child.val();
                var newLi = "<li class='nav-item '>";
                newLi += "<a class='nav-link result-nav-link' id='" + cv.activity_key + "-tab' data-toggle='tab' href='#" + cv.activity_key + "'";
                newLi += "role='tab'></a></li>";
                $("#resultTab").append(newLi);
                i++;
                var html = "<div class='tab-pane fade  result-tab-content' id='" + cv.activity_key + "'";
                html += "role='tabpanel'><div class='row'><div class='col-6'><h3 class='results-activity-title' id='title-" + cv.activity_key + "'></h3>";
                html += "<span id='status-" + cv.activity_key + "' class='badge results-activity-status'>" + cv.status + "</span>";
                html += "<small class='results-activity-desc' id='desc-" + cv.activity_key + "'></small>";
                html += "<button type='button' class='btn btn-theme-secondary results-activity-users mt-3'>Users";
                html += "<span class='user-badge badge badge-theme'>" + cv.users + "</span></button>";
                html += "</div>";
                var yelpApiDivId = "yelpAPI-" + cv.activity_key;
                var resultKeywords = cv.result_keywords;
                html += "<div id='" + yelpApiDivId + "' class='col-6'>";
                html += "<div class='mt-5'><div class='outerCircle'></div><div class='innerCircle'></div><div class='icon'></div></div>"; 
                if(resultKeywords) {
                    rkey1 = resultKeywords.r1;
                    rkey2 = resultKeywords.r2;
                    rkey3 = resultKeywords.r3;
                }
                getYelpApiResults(yelpApiDivId, [rkey1, rkey2, rkey3]);
                // html += "<h3>Suggested Venues</h3><img src='assets/images/resultDemo.jpg' width='500' />";        
                html += "</div></div></div>";
                $("#resultTabContent").append(html);
                if (cv.status == "pending") {
                    $("#status-" + cv.activity_key).addClass("badge-warning");
                } else if (cv.status == "in progress") {
                    $("#status-" + cv.activity_key).addClass("badge-info");
                } else if (cv.status == "complete") {
                    $("#status-" + cv.activity_key).addClass("badge-success");
                }

                db.ref('activities').orderByChild('activity_id').equalTo(cv.activity_id).on("child_added", function (activitychild) {
                    $("#" + cv.activity_key + "-tab").text(activitychild.key);
                    $("#title-" + cv.activity_key).text(activitychild.key);
                    $("#desc-" + cv.activity_key).text(activitychild.val().activity_desc);

                });

            });
            $(".tab-pane").first().addClass("show active");
            $(".result-nav-link").first().addClass("active");
        });
    }
    function getYelpApiResults(yelpApiDivId, resultKeywords) {
        var html = "<h3>Suggested Venues</h3>";
       for(i=0; i < resultKeywords.length; i++){
           console.log(resultKeywords[i]);
        var myurl = "https://api.yelp.com/v3/businesses/search?term=" + resultKeywords[i] + "&location=austin-tx&limit=1";
        $.ajax({
            url: "https://cors-anywhere.herokuapp.com/" + myurl,
            headers: {
                'Authorization': 'Bearer 51MljoOv5CQaR6wRoitgJaWnE5CxBDWtzQ5Ht7Hm-jLOAxK51e42Q0cMjSm3OUHVORFGWNyGFcqO0yutAU5fdEFJH9ClR9ETWYBO-_xa86VycE3Mi_yy-fWPUCVfXHYx',
            },
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                // Grab the results from the API JSON return               
                var totalresults = data.total;
                // If our results are greater than 0, continue
                if (totalresults > 0) {
                    // Itirate through the JSON array of 'businesses' which was returned by the API
                    $.each(data.businesses, function (i, item) {
                        // Store each business's object in a variable
                        var id = item.id;
                        var page = item.url
                        var phone = item.display_phone;
                        var image = item.image_url;
                        var name = item.name;
                        var rating = item.rating;
                        var reviewcount = item.review_count;
                        var address = item.location.address1;
                        var city = item.location.city;
                        var state = item.location.state;
                        var zipcode = item.location.zip_code;
                        // Append our result into our page                        
                        html += "<div class='yelp-result-wrapper mt-4' id='wrapper-" + id + "'>";
                        html += "<div class='yelp-details'>";
                        html += "<div class='yelp-business-location mt-2 mr-2'>" + address + "<br>" + city + ", " + state + " " + zipcode + "<br>" + phone +"</div>";
                        html += "<img class='yelp-image float-left mr-2' id='image-" + id + "' src='" + image + "' alt='" + name +"'>";                        
                        html += "<a class='yelp-business-name' target='_blank' href='" + page + "'>" + name + "</a>";
                        html += "<img class='yelp-business-rating' src='assets/images/yelp_stars/small_";
                        if(rating == "4.5") {
                            rating = Math.floor(rating);
                            html += rating + "_half";
                        } else {
                            html += rating;
                        }
                        html += ".png' >";
                        html += "<p class='yelp-business-reviews mt-3'>Based on " + reviewcount + " reviews</p>";
                        html += "</div>";         
                        
                        console.log(html);
                    });
                    $("#" + yelpApiDivId).empty();
        $("#" + yelpApiDivId).append(html);
                } else {
                    // If our results are 0; no businesses were returned by the JSON therefor we display on the page no results were found
                    html = "<h5>no results!</h5>";
                    
                }
            }
        });

       }
        
        
    }
   
    // Logout functionality
    $(document).on("click", "#logOutLink", function () {
        console.log("Logout");
        firebase.auth().signOut();
        Cookies.remove('userDetail');
        Cookies.remove("userStatus");
        localStorage.removeItem("selectedUser");
        $("#userLogin").show();

        window.location.replace("../project-1/index.html");

    });

    // test user/admin redirect
    $("#adminAsUser").on("click", function () {

        window.location.href = "index.html";
        userFlow();
    });
    $("#adminAsAdmin").on("click", function () {
        window.location.href = "admin.html";
    });
});

