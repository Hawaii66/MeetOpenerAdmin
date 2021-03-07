const LogginDiv = document.querySelector(".NotLoggedIn");
const SingUpDiv = document.querySelector(".SignUp");
const CreateDiv = document.querySelector(".LoggedIn");
const loginForm = document.querySelector("#Login");
const singUpForm = document.querySelector("#SignUp");
const newTimetablePromtDiv = document.querySelector(".NewTimetablePromt");
const createNewLectureDiv = document.querySelector(".CreateNewLecture");
const createNewLectureForm = document.querySelector("#createLectureInExistingTimetable");
const createNewLectureDefault = document.querySelector("#NewTimetableDefaultSettings");
const TimetableManager = document.querySelector(".TimeTableManager");

const previousTimetables = document.querySelector(".OwnedTimeTables");

const localhost = "http://localhost:5000/";
const website_URL = "https://meetopenerserver.herokuapp.com/";
const MAIN_URL = website_URL;
const LOGIN_URL = MAIN_URL + "Login";
const Get_LOGIN_INFORMATION = MAIN_URL + "GetLogInInformation";
const Get_TIMETABLES_WITH_ID = MAIN_URL + "GetTimetablesWithID";
const SORT_TIMETABLE = MAIN_URL + "SortTimetable";
const SAVE_TIMETABLE = MAIN_URL + "SaveTimetable";
const CREATE_LECTURE_ON_CURRENT_TIMETABLE = MAIN_URL + "CreateLecture";
const CREATE_TIMETABLE_URL = MAIN_URL + "CreateTimeTable";
const DELETE_CURRENT_TIMETABLE = MAIN_URL + "DeleteTimetableID";

//errors
LogginDiv.querySelector(".LoginError").style.display = "none";
SingUpDiv.querySelector(".SignUpError").style.display = "none";
TimetableManager.querySelector(".TimetableError").style.display = "none";
createNewLectureDiv.querySelector(".CreateNewLectureError").style.display = "none";
newTimetablePromtDiv.querySelector(".NewTimetableError").style.display = "none";
createNewLectureDiv.style.display = "none";

ChangeLoggedIn(false);
createNewLectureDefault.style.display = "none";
TimetableManager.querySelector(".DeleteTimetable").style.display = "none";

let accountName = "";
let accountPassword = "";
let currentTimetable = [];
let lectureEditIcons = [];
let currentTimetableID = "";

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    LogginDiv.querySelector(".LoginError").style.display = "none";
    Login(false);
});

singUpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    SingUpDiv.querySelector(".SignUpError").style.display = "none";
    Login(true);
})

createNewLectureForm.addEventListener("submit", (event) => {
    event.preventDefault();
    CreateNewLecture();
});

createNewLectureDefault.addEventListener("submit", (event) => {
    event.preventDefault();
    CreateDefaultTimetable();
    createNewLectureDefault.reset();
});

function DeleteCurrentTimetable() {
    console.log(currentTimetable);
    console.log(currentTimetableID);
    const toSend = {
        lectures: currentTimetable,
        timetableID: currentTimetableID
    }
    fetch(DELETE_CURRENT_TIMETABLE, {
            method: "Post",
            body: JSON.stringify(toSend),
            headers: {
                "content-type": "application/json"
            }
        }).then(response => response.json())
        .then(deleted => {
            console.log(deleted);
            const timetableParent = document.querySelector(".TimeTable");
            timetableParent.innerHTML = "";
            TimetableManager.querySelector(".DeleteTimetable").style.display = "none"; //Show delete button
            LogInSetup();
        });
}

function CreateDefaultTimetable() {
    newTimetablePromtDiv.querySelector(".NewTimetableError").style.display = "none";

    const formData = new FormData(createNewLectureDefault);
    const name = formData.get("NewTimetableDefaultName");
    const password = formData.get("NewTimetableDefaultPassword");
    const oneMinutebefore = formData.get("NewTimetableDefaultOneMinuteBefore");
    const lectures = [
        { name: "Social Science", url: "youtube.com", time: "08:20", day: "Mo" },
        { name: "Math", url: "youtube.com", time: "09:30", day: "Mo" },
        { name: "English", url: "youtube.com", time: "10:10", day: "We" },
        { name: "Physical Education", url: "youtube.com", time: "12:20", day: "Fr" }
    ]
    const toSend = {
        name,
        password,
        oneMinutebefore,
        accountName,
        accountPassword,
        lectures
    }
    console.log(toSend);
    fetch(CREATE_TIMETABLE_URL, {
            method: "Post",
            body: JSON.stringify(toSend),
            headers: {
                "content-type": "application/json"
            }
        }).then(response => response.json())
        .then(newTimetable => {
            console.log(newTimetable);
            if (newTimetable.message === "ErrowWithData") {
                //Error
                newTimetablePromtDiv.querySelector(".NewTimetableError").style.display = "";
            }
            //Update previous timetables
            LogInSetup();
            newTimetablePromtDiv.style.display = "none";
        });

}

function Login(isCreating) {
    let formData;
    let name;
    let password;
    if (isCreating === true) {
        formData = new FormData(singUpForm);
        name = formData.get("SignUpName");
        password = formData.get("SignUpPassword");
    } else {
        formData = new FormData(loginForm);
        name = formData.get("LoginName");
        password = formData.get("LoginPassword");
    }
    let isCreatingOn;
    if (isCreating) {
        isCreatingOn = "on";
    } else {
        isCreatingOn = undefined;
    }

    loginForm.reset();

    const toSend = {
        name,
        password,
        isCreatingOn
    }
    console.log(toSend);

    fetch(LOGIN_URL, {
            method: "Post",
            body: JSON.stringify(toSend),
            headers: {
                "content-type": "application/json"
            }
        }).then(response => response.json())
        .then(login => {
            if (login.message === "ERROR") {
                console.log("Error");
                if (isCreating === true) {
                    SingUpDiv.querySelector(".SignUpError").style.display = "";
                } else {
                    LogginDiv.querySelector(".LoginError").style.display = "";
                }
                return;
            }
            accountName = login.name;
            accountPassword = login.password;
            console.log("Logged in");
            ChangeLoggedIn(true);
            LogInSetup();
        });
}

function CreateNewLecture() {
    createNewLectureDiv.querySelector(".CreateNewLectureError").style.display = "none";
    const formData = new FormData(createNewLectureForm);
    const name = formData.get("createLectureInName").toString();
    const url = formData.get("createLectureInLink").toString();
    const time = formData.get("createLectureInTime").toString();
    const day = formData.get("createLectureInDay").toString();

    if (name.toString() === "" || url.toString() === "" || time.toString() === "") {
        console.log("CREATE NEW LECTURE ERROR");
        createNewLectureDiv.querySelector(".CreateNewLectureError").style.display = "";
        return;
    }

    const lectureInfo = {
        name,
        url,
        time,
        day
    };
    console.log(lectureInfo);
    const toSend = {
        id: currentTimetableID,
        lecture: lectureInfo
    }
    fetch(CREATE_LECTURE_ON_CURRENT_TIMETABLE, {
            method: "Post",
            body: JSON.stringify(toSend),
            headers: {
                "content-type": "application/json"
            }
        }).then(response => response.json())
        .then(info => {
            console.log(info);
            GenerateTimeTable(info.lectures, info.id);
        });
}

function LogInSetup() {
    const toSend = {
        name: accountName,
        password: accountPassword
    };
    fetch(Get_LOGIN_INFORMATION, {
            method: "Post",
            body: JSON.stringify(toSend),
            headers: {
                "content-type": "application/json"
            }
        }).then(response => response.json())
        .then(admin => {
            if (admin === undefined) {
                return;
            }

            GetPreviousTimeTables(admin.timetables, (timetables) => {
                console.log(timetables);
                console.log("Succes");
                CreatePreviousTimetables(timetables);
            });
        });
}

function CreatePreviousTimetables(timetables) {
    previousTimetables.innerHTML = "";
    const ulList = document.createElement("ul");

    for (let i = 0; i < timetables.length; i++) {
        const timetable = timetables[i];
        const list = document.createElement("li");
        const atag = document.createElement("a");
        atag.href = "#";
        atag.onclick = function() {
            createNewLectureDiv.style.display = "";
            newTimetablePromtDiv.style.display = "none";
            currentTimetableID = timetable._id;
            GenerateTimeTable(timetable.lectures, timetable._id, timetable.name);
        }
        atag.textContent = timetable.name.toString();
        list.appendChild(atag);
        ulList.appendChild(list);
    }
    const createNewTimetable = GenerateHTMLNewTimetable();
    ulList.append(createNewTimetable);
    previousTimetables.appendChild(ulList);
}

function GenerateHTMLNewTimetable() {
    const list = document.createElement("li");
    const atag = document.createElement("a");
    atag.href = "#";
    atag.onclick = function() {
        createNewLectureDefault.reset();

        newTimetablePromtDiv.querySelector(".NewTimetableError").style.display = "none";

        newTimetablePromtDiv.style.display = "";
        console.log("Clicked new timetable");
        ShowCreateDefaultTimetable();
    }
    atag.textContent = "New Timetable";
    list.append(atag);
    return list;
}

function ShowCreateDefaultTimetable() {
    createNewLectureDefault.style.display = "";
}

function GetPreviousTimeTables(timetableIDs, callback) {
    console.log("888888888888888888");
    console.log(timetableIDs);
    if (timetableIDs.length === 0) {
        timetableIDs = [];
    }
    const toSend = {
        ids: timetableIDs
    }

    fetch(Get_TIMETABLES_WITH_ID, {
            method: "Post",
            body: JSON.stringify(toSend),
            headers: {
                "content-type": "application/json"
            }
        }).then(response => response.json())
        .then(result => {
            callback(result);
        });
}

function ChangeLoggedIn(isLoggedIn) {
    if (isLoggedIn === true) {
        LogginDiv.style.display = "none";
        CreateDiv.style.display = "";
    } else {
        LogginDiv.style.display = "";
        CreateDiv.style.display = "none";
    }
}

function LogOut() {
    loginForm.reset();
    const timetableParent = document.querySelector(".TimeTable");
    timetableParent.innerHTML = "";
    TimetableManager.querySelector(".DeleteTimetable").style.display = "none"; //Show delete button
    createNewLectureDiv.style.display = "none";
    ChangeLoggedIn(false);
}

function Test(test) {
    console.log("--------------TES" + test.toString());
}

function GenerateTimeTable(timetable, id, timetableName) {
    const toSend = {
        timetable
    }
    console.log(toSend);
    fetch(SORT_TIMETABLE, {
            method: "Post",
            body: JSON.stringify(toSend),
            headers: {
                "content-type": "application/json"
            }
        }).then(response => response.json())
        .then(result => {
            console.log("TEST");
            timetable = result;
            GenerateTimeTable2(timetable, id, timetableName);
        });
}

function GenerateTimeTable2(timetable, id, timetableName) {
    const timetableParent = document.querySelector(".TimeTable");
    timetableParent.innerHTML = "";
    const differentDays = GetDifferentDays(timetable);

    let index = 0;
    for (let i = 0; i < differentDays.length; i++) {
        const mainDiv = CreateDay(differentDays[i]);

        for (let j = 0; j < timetable.length; j++) {
            const lecture = timetable[j];

            if (lecture.day.toString() === differentDays[i].toString()) {
                const lectureDiv = CreateLecture(lecture.url, lecture.time, lecture.name, lecture.day, index, id);
                mainDiv.appendChild(lectureDiv);
                index += 1;
            }
        }
        timetableParent.appendChild(mainDiv);
    }

    currentTimetable = timetable;
    console.log(currentTimetable);

    //CSS
    TimetableManager.querySelector(".DeleteTimetable").style.display = ""; //Show delete button
    timetableParent.style.setProperty('grid-template-columns', 'repeat(' + differentDays.length + ', 1fr)');
    if (differentDays.length === 7) {
        timetableParent.style.setProperty('width', "100%");
        timetableParent.style.setProperty('margin-left', "0%");
        timetableParent.style.setProperty('margin-right', "0%");
        timetableParent.style.setProperty("grid-gap", "0em");
        //timetableParent.style.setProperty('width', "100%");
    } else {
        timetableParent.style.setProperty('width', "90%");
        timetableParent.style.setProperty('margin-left', "5%");
        timetableParent.style.setProperty('margin-right', "5%");
        timetableParent.style.setProperty("grid-gap", "1em");
    }
}

function GetDifferentDays(timetable) {
    toReturn = [];
    for (let i = 0; i < timetable.length; i++) {
        const lecture = timetable[i];
        if (!toReturn.includes(lecture.day.toString())) {
            toReturn.push(lecture.day.toString());
        }
    }

    return toReturn //Return a list with every name once
}

function CreateDay(name) {
    const div = document.createElement("div");
    div.className = "TimeTableDay";
    const header = document.createElement("div");
    header.className = "TimeTableHeader";
    const lectures = document.createElement("div");
    lectures.className = "TimeTableLectures";

    const headerH2 = document.createElement("h2");
    headerH2.textContent = GetFullName(name).toString();
    header.appendChild(headerH2);

    div.appendChild(header);
    div.appendChild(lectures);

    return div;
}

function GetFullName(name) {
    if (name.toString() === "Mo") { return "Monday"; }
    if (name.toString() === "Tu") { return "Tuesday"; }
    if (name.toString() === "We") { return "Wednesday"; }
    if (name.toString() === "Th") { return "Thursday"; }
    if (name.toString() === "Fr") { return "Friday"; }
    if (name.toString() === "Sa") { return "Saturday"; }
    if (name.toString() === "Su") { return "Sunday"; }
    return name;
}

function ApplyChanges(isSave, lecture, form, index, timetableID) {
    TimetableManager.querySelector(".TimetableError").style.display = "none";
    if (isSave) {
        console.log(isSave);
        console.log(lecture);
        const formData = new FormData(form);
        const newName = formData.get("FormName");
        const newLink = formData.get("FormLink");
        const newTime = formData.get("FormTime");
        const newDay = formData.get("FormDay");

        if (newName === "" || newLink === "") {
            console.log("ERROR");
            TimetableManager.querySelector(".TimetableError").style.display = "";
            return;
        }

        const newLecture = {
            name: newName,
            url: newLink,
            time: newTime,
            day: newDay
        }
        console.log(newLecture);
        currentTimetable[index] = newLecture;
    } else {
        console.log("---TEST---");
        console.log(currentTimetable.length.toString());
        currentTimetable.splice(index, 1);
        console.log(currentTimetable.length.toString());
        console.log("DELETING000");
    }
    console.log(currentTimetable);

    SaveTimetable(currentTimetable, timetableID, (currentTimetable) => {
        console.log(timetableID);
        console.log("----");
        console.log(currentTimetable);
        GenerateTimeTable(currentTimetable.lectures, timetableID);
        ShowIcons(true);
    });
}

function SaveTimetable(timetable, id, callback) {
    console.log("SENDING SAVE REQUEST");
    const toSend = {
        id: id,
        timetable: timetable
    }
    fetch(SAVE_TIMETABLE, {
            method: "Post",
            body: JSON.stringify(toSend),
            headers: {
                "content-type": "application/json"
            }
        }).then(response => response.json())
        .then(newTimetable => {
            console.log("AAAAAAAAAAAAAAAAAAAAA");
            console.log(newTimetable);
            timetable = newTimetable;
            callback(timetable);
            return;
        });
}

function ChangeLecture(lecture, index, defaultLink, defaultTime, defaultName, defaultDay, timetableID) {
    createNewLectureDefault.style.display = "none";
    ShowIcons(false);
    console.log(lecture);
    div = lecture;
    div.innerHTML = "";
    const Form = document.createElement("form");
    const Name = document.createElement("h2");
    const name = document.createElement("input");
    const Link = document.createElement("h2");
    const link = document.createElement("input");
    const Time = document.createElement("h2");
    const time = document.createElement("input");
    const Day = document.createElement("h2");
    const day = GenerateSelectDay();

    const deleteIcon = document.createElement("i");
    const saveIcon = document.createElement("i");
    const br1 = document.createElement("br");
    const br2 = document.createElement("br");
    const br3 = document.createElement("br");
    const br4 = document.createElement("br");

    deleteIcon.className = "fas fa-trash-alt";
    saveIcon.className = "fas fa-save";
    console.log(timetableID);
    console.log("--------");
    saveIcon.onclick = function() {
        ApplyChanges(true, lecture, Form, index, timetableID);
    }
    deleteIcon.onclick = function() {
        ApplyChanges(false, null, null, index, timetableID);
    }

    Name.textContent = "Name";
    Link.textContent = "Link";
    Time.textContent = "Time";
    Day.textContent = "Day";

    name.type = "text";
    name.name = "FormName";
    link.type = "url";
    link.name = "FormLink";
    time.type = "time";
    time.name = "FormTime";

    console.log(lecture[index]);
    if (defaultName != undefined) {
        defaultName.value = defaultName;
    }
    link.value = defaultLink;
    time.value = defaultTime;
    day.value = defaultDay;

    Form.appendChild(Name);
    Form.appendChild(name);
    Form.appendChild(Link);
    Form.appendChild(link);
    Form.appendChild(Time);
    Form.appendChild(time);
    Form.appendChild(Day);
    Form.appendChild(day);
    Form.appendChild(br1);
    Form.appendChild(deleteIcon);
    Form.appendChild(br2);
    Form.appendChild(saveIcon);
    Form.appendChild(br3);

    div.appendChild(Form);
}

function ShowIcons(newState) {
    for (let i = 0; i < lectureEditIcons.length; i++) {
        const icon = lectureEditIcons[i];
        if (newState === true) {
            icon.style.display = "";
        } else {
            icon.style.display = "none";
        }
    }
}

function GenerateSelectDay() {
    const day = document.createElement("select");
    day.name = "LectureDay";

    const mo = document.createElement("option");
    mo.value = "Mo";
    mo.textContent = "Monday";
    const tu = document.createElement("option");
    tu.value = "Tu";
    tu.textContent = "Tuesday";
    const we = document.createElement("option");
    we.value = "We";
    we.textContent = "Wednesday";
    const th = document.createElement("option");
    th.value = "Th";
    th.textContent = "Thursday";
    const fr = document.createElement("option");
    fr.value = "Fr";
    fr.textContent = "Friday";
    const sa = document.createElement("option");
    sa.value = "Sa";
    sa.textContent = "Saturday";
    const su = document.createElement("option");
    su.value = "Su";
    su.textContent = "Sunday";

    day.appendChild(mo);
    day.appendChild(tu);
    day.appendChild(we);
    day.appendChild(th);
    day.appendChild(fr);
    day.appendChild(sa);
    day.appendChild(su);

    day.name = "FormDay";
    return day;
}

function CreateLecture(LINK, TIME, NAME, DAY, index, timetableID) {
    const div = document.createElement("div");
    const Link = document.createElement("h2");
    const link = document.createElement("h3");
    const Time = document.createElement("h2");
    const time = document.createElement("h3");
    const editIcon = document.createElement("i");
    const br = document.createElement("br");

    div.className = "TimeTableLecture";
    Link.className = "TimeTableLinkH2";
    link.className = "TimeTableLinkH3";
    Time.className = "TimeTableTimeH2";
    time.className = "TimeTableTimeH3";

    editIcon.className = "fas fa-pen";
    lectureEditIcons.push(editIcon);

    Link.textContent = "Link:"
    if (NAME != undefined) {
        Link.textContent = NAME.toString();
    } else {}
    link.textContent = LINK.toString();
    Time.textContent = "Time:"
    time.textContent = TIME.toString();

    div.appendChild(Link);
    div.appendChild(link);
    div.appendChild(Time);
    div.appendChild(time);
    div.appendChild(editIcon);
    div.appendChild(br);

    editIcon.onclick = function() {
        ChangeLecture(div, index, LINK, TIME, NAME, DAY, timetableID);
    }

    return div;
}
