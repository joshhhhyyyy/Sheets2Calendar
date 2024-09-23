const calendarId = "Go to google calendar, create a new calendar or use an existing one, go to its settings and copy the link in Integrate Calendar";
const dataRange = "A2:H176";
var lineBreak = "\r\n";
var PlaceholderFutureDate = new Date("2025"); // Lmao there is no method to get everything after x

function onOpen() {
    SpreadsheetApp.getUi().createMenu('Calendar')
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

function parseTimeslot(period,hour) {
    if (period.toUpperCase() === "PM" && Number(hour) !== 12) {
      hour = Number(hour) + 12;
    } else if (period.toUpperCase() === "AM" && Number(hour) === 12) {
      hour = 0;
    }
    return hour
}


function addEventsToCalendar(StartDate = new Date()) {
    var events = SpreadsheetApp.getActiveSheet().getRange(dataRange).getValues().filter(function(r) {
        return r.join("").length > 0;
    });

    deleteAutoCreatedEvents(StartDate);
    Logger.log(`---------- deleteAutoCreatedEvents() ran successfully ----------`);

    for (var event of events) {
        var date = new Date(event[1]);
        var timeslot = event[3];
        var worklocation = event[4];
        var locationtype = event[6];
        var shifthours = event[7];
        var totalpay = event[8];

        if (timeslot !== 'OFF' && date > StartDate) {
            var times = timeslot.split(" - ");
            let [startTime, startTimePeriod] = times[0].split(/(AM|PM)/i);
            let [endTime, endTimePeriod] = times[1].split(/(AM|PM)/i);
            var startDateTime = new Date(date.setHours(parseTimeslot(startTimePeriod,startTime)));
            var endDateTime = new Date(date.setHours(parseTimeslot(endTimePeriod,endTime)))
            
            CalendarApp.getCalendarById(calendarId).createEvent(`work @ ${worklocation}`,
                startDateTime,endDateTime,
                  { description: `${shifthours}h shift${lineBreak}$${totalpay} Total Pay`,
                    location: `${locationtype}`});
            Logger.log(`Added work @ ${worklocation}${lineBreak}from ${startDateTime}${lineBreak}to ${endDateTime}`);
        };
    }
}

function CycleALL() {
    addEventsToCalendar(new Date("2022"));
}
