const calendarId = "integrate ID, ending in @group.calendar.google.com";
const dataRange = "A2:I176";
var lineBreak = "\r\n";
var PlaceholderFutureDate = new Date("2026"); // Lmao there is no method to get everything after x

function onOpen() {
    SpreadsheetApp.getUi().createMenu('Calendar')
        .addItem('Push Upcoming Shifts to Calendar', "addEventsToCalendar")
        .addToUi();
}

function deleteAutoCreatedEvents(StartDate) {
    var eventCal = CalendarApp.getCalendarById(calendarId);
    var events = eventCal.getEvents(StartDate, PlaceholderFutureDate);
    var removecount = 0;
    for (var i = 0; i < events.length; i++) {
        var ev = events[i];
        var title = ev.getTitle();
        var starttime = ev.getStartTime();
        var endtime = ev.getEndTime();
        ev.deleteEvent();
        var removecount = removecount + 1
        Logger.log(`Deleted ${title}${lineBreak}from ${starttime}${lineBreak}to ${endtime}`);
    }
    return removecount
}

function parseTimeslot(rawinput) {
    let [rawtime, period] = rawinput.split(/(AM|PM)/i);
    let [hour, minutes] = rawtime.trim().split(":").map(Number);
    
    if (minutes == null){
      minutes = 0
    }
    
    if (period.toUpperCase() === "PM" && Number(hour) !== 12) {
      hour = Number(hour) + 12;
    } else if (period.toUpperCase() === "AM" && Number(hour) === 12) {
      hour = 0;
    }
    return [hour,minutes]
}


function addEventsToCalendar(StartDate = new Date(new Date().toDateString())) {
    var events = SpreadsheetApp.getActiveSheet().getRange(dataRange).getValues().filter(function(r) {
        return r.join("").length > 0;
    });

    var removecount = deleteAutoCreatedEvents(StartDate);
    Logger.log(`---------- deleteAutoCreatedEvents() ran successfully ----------`);
    var addcount = 0

    for (var event of events) {
        var date = event[1];
        var timeslot = event[3];
        var worklocation = event[4];
        var locationtype = event[6];
        var shifthours = event[7];
        var totalpay = event[8];

        if (timeslot !== 'OFF' && date >= StartDate) {
            var times = timeslot.split(" - ");

            let [startHour, startMinute] = parseTimeslot(times[0]);
            let [endHour, endMinute] = parseTimeslot(times[1]);
            
            var startDateTime = new Date(date.setHours(startHour,startMinute));
            var endDateTime = new Date(date.setHours(endHour,endMinute));
            
            CalendarApp.getCalendarById(calendarId).createEvent(`work @ ${worklocation}`,
                startDateTime,endDateTime,
                  { description: `${shifthours}h shift${lineBreak}$${totalpay} Total Pay`,
                    location: `${locationtype}`});
            Logger.log(`Added work @ ${worklocation}${lineBreak}from ${startDateTime}${lineBreak}to ${endDateTime}`);
            var addcount = addcount + 1
        };
    }
    SpreadsheetApp.getActive().toast(`${addcount} added, ${removecount} removed`, `✅ Shifts pushed to calendar`, 15);
    Logger.log(`${addcount} added, ${removecount} removed`)
}

function CycleALL() {
    addEventsToCalendar(new Date("2022"));
}
