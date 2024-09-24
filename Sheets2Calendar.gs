const calendarId = "9ed72310904bfc77b97ab2855b59218d56b93deefb159870c20212dd3d693858@group.calendar.google.com";
const dataRange = "A2:I176";
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
            
            let [startHour, startMinute] = parseTimeslot(times[0])
            let [endHour, endMinute] = parseTimeslot(times[1])
            
            var startDateTime = new Date(date.setHours(startHour,startMinute));
            var endDateTime = new Date(date.setHours(endHour,endMinute))
            
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
