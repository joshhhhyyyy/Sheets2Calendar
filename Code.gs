const calendarId = "Go to google calendar, create a new calendar or use an existing one, go to its settings and copy the link in Integrate Calendar";
const dataRange = "A2:H176";
var lineBreak = "\r\n";
var PlaceholderFutureDate = new Date("2025"); // Lmao there is no method to get everything after x so its just an arbitrary future date

function onOpen() {
    SpreadsheetApp.getUi().createMenu('Calendar Tools')
        .addItem('Push Upcoming Shifts to Calendar', "addEventsToCalendar")
        .addToUi();
}

function deleteAutoCreatedEvents(StartDate) {
    var eventCal = CalendarApp.getCalendarById(calendarId);
    var events = eventCal.getEvents(StartDate, PlaceholderFutureDate);
    for (var i = 0; i < events.length; i++) {
        var ev = events[i];
        var title = ev.getTitle();
        var starttime = ev.getStartTime();
        var endtime = ev.getEndTime();
        ev.deleteEvent();
        Logger.log(`Deleted ${title}${lineBreak}from ${starttime}${lineBreak}to ${endtime}`);
    }
}

function addEventsToCalendar(StartDate = new Date()) {
    var spreadsheet = SpreadsheetApp.getActiveSheet();
    var eventCal = CalendarApp.getCalendarById(calendarId);
    var rawEvents = spreadsheet.getRange(dataRange).getValues();
    var events = rawEvents.filter(function(r) {
        return r.join("").length > 0;
    });

    deleteAutoCreatedEvents(StartDate);
    Logger.log(`---------- deleteAutoCreatedEvents() ran successfully ----------`);

    for (var event of events) {

        var date = event[0];
        var timeslot = event[2];
        var worklocation = event[3];
        var locationtype = event[5];
        var shifthours = event[6];
        var totalpay = event[7];

        var prompt = `Placeholder on ${date} from ${timeslot}`;
        var eventdescription = `${shifthours}h shift${lineBreak}$${totalpay} Total Pay`;

        if (timeslot !== 'OFF' && date > StartDate) {
            var newEvent = eventCal.createEventFromDescription(prompt);
            newEvent.setTitle(`work @ ${worklocation}`);
            newEvent.setDescription(eventdescription);
            newEvent.setLocation(locationtype);
            Logger.log(`Added work @ ${worklocation}${lineBreak}on ${date}${lineBreak}from ${timeslot}${lineBreak}${lineBreak}Prompt: ${prompt}`);
        };
    }
}

function CycleALL() {
    addEventsToCalendar(new Date("2022"));
}
