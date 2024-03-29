(function ($) {

    "use strict";

    // Setup the calendar with the current date
    $(document).ready(function () {
        var date = new Date();
        var today = date.getDate();
        // Set click handlers for DOM elements
        $(".right-button").click({ date: date }, next_year);
        $(".left-button").click({ date: date }, prev_year);
        $(".month").click({ date: date }, month_click);
        // $("#add-button").click({date: date}, new_event);
        // Set current month as active
        $(".months-row").children().eq(date.getMonth()).addClass("active-month");
        init_calendar(date);
        var events = check_events(today, date.getMonth() + 1, date.getFullYear());
        show_events(events, months[date.getMonth()], today);
    });

    // Initialize the calendar by appending the HTML dates
    function init_calendar(date) {
        $(".tbody").empty();
        $(".events-container").empty();
        var calendar_days = $(".tbody");
        var month = date.getMonth();
        var year = date.getFullYear();
        var day_count = days_in_month(month, year);
        var row = $("<tr class='table-row'></tr>");
        var today = date.getDate();
        // Set date to 1 to find the first day of the month
        date.setDate(1);
        var first_day = date.getDay();
        // 35+firstDay is the number of date elements to be added to the dates table
        // 35 is from (7 days in a week) * (up to 5 rows of dates in a month)
        for (var i = 0; i < 35 + first_day; i++) {
            // Since some of the elements will be blank, 
            // need to calculate actual date from index
            var day = i - first_day + 1;
            // If it is a sunday, make a new row
            if (i % 7 === 0) {
                calendar_days.append(row);
                row = $("<tr class='table-row'></tr>");
            }
            // if current index isn't a day in this month, make it blank
            if (i < first_day || day > day_count) {
                var curr_date = $("<td class='table-date nil'>" + "</td>");
                row.append(curr_date);
            }
            else {
                var curr_date = $("<td class='table-date'>" + day + "</td>");
                var events = check_events(day, month + 1, year);
                if (today === day && $(".active-date").length === 0) {
                    curr_date.addClass("active-date");
                    show_events(events, months[month], day);
                }
                // If this date has any events, style it with .event-date
                if (events.length !== 0) {
                    curr_date.addClass("event-date");
                }
                // Set onClick handler for clicking a date
                curr_date.click({ events: events, month: months[month], day: day }, date_click);
                row.append(curr_date);
            }
        }
        // Append the last row and set the current year
        calendar_days.append(row);
        $(".year").text(year);
    }

    // Get the number of days in a given month/year
    function days_in_month(month, year) {
        var monthStart = new Date(year, month, 1);
        var monthEnd = new Date(year, month + 1, 1);
        return (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
    }

    // Event handler for when a date is clicked
    function date_click(event) {
        $(".events-container").show(250);
        $("#dialog").hide(250);
        $(".active-date").removeClass("active-date");
        $(this).addClass("active-date");
        show_events(event.data.events, event.data.month, event.data.day);
    };

    // Event handler for when a month is clicked
    function month_click(event) {
        $(".events-container").show(250);
        $("#dialog").hide(250);
        var date = event.data.date;
        $(".active-month").removeClass("active-month");
        $(this).addClass("active-month");
        var new_month = $(".month").index(this);
        date.setMonth(new_month);
        init_calendar(date);
    }

    // Event handler for when the year right-button is clicked
    function next_year(event) {
        $("#dialog").hide(250);
        var date = event.data.date;
        var new_year = date.getFullYear() + 1;
        $("year").html(new_year);
        date.setFullYear(new_year);
        init_calendar(date);
    }

    // Event handler for when the year left-button is clicked
    function prev_year(event) {
        $("#dialog").hide(250);
        var date = event.data.date;
        var new_year = date.getFullYear() - 1;
        $("year").html(new_year);
        date.setFullYear(new_year);
        init_calendar(date);
    }

    // Event handler for clicking the new event button
    function new_event(event) {
        // if a date isn't selected then do nothing
        if ($(".active-date").length === 0)
            return;
        // remove red error input on click
        $("input").click(function () {
            $(this).removeClass("error-input");
        })
        // empty inputs and hide events
        $("#dialog input[type=text]").val('');
        $("#dialog input[type=number]").val('');
        $(".events-container").hide(250);
        $("#dialog").show(250);
        // Event handler for cancel button
        $("#cancel-button").click(function () {
            $("#name").removeClass("error-input");
            $("#count").removeClass("error-input");
            $("#dialog").hide(250);
            $(".events-container").show(250);
        });
        // Event handler for ok button
        $("#ok-button").unbind().click({ date: event.data.date }, function () {
            var date = event.data.date;
            var name = $("#name").val().trim();
            var count = parseInt($("#count").val().trim());
            var day = parseInt($(".active-date").html());
            // Basic form validation
            if (name.length === 0) {
                $("#name").addClass("error-input");
            }
            else if (isNaN(count)) {
                $("#count").addClass("error-input");
            }
            else {
                $("#dialog").hide(250);
                console.log("new event");
                new_event_json(name, count, date, day);
                date.setDate(day);
                init_calendar(date);
            }
        });
    }

    // Adds a json event to event_data
    function new_event_json(name, count, date, day) {
        var event = {
            "occasion": name,
            "invited_count": count,
            "year": date.getFullYear(),
            "month": date.getMonth() + 1,
            "day": day
        };
        event_data["events"].push(event);
    }

    // Display all events of the selected date in card views
    function show_events(events, month, day) {
        // Clear the dates container
        $(".events-container").empty();
        $(".events-container").show(250);
        //console.log(event_data["events"]);
        // If there are no events for this date, notify the user
        if (events.length === 0) {
            var event_card = $("<div class='event-card'></div>");
            var event_name = $("<div class='event-name'>Não existem eventos em " + day + " de " + month + ".</div>");
            $(event_card).css({ "border-left": "10px solid #FF1744" });
            $(event_card).append(event_name);
            $(".events-container").append(event_card);
        }
        else {
            // Go through and add each event as a card to the events container
            for (var i = 0; i < events.length; i++) {
                var event_card = $("<div class='event-card'></div>");
                var event_name = $("<div class='event-name'>" + events[i]["occasion"] + "</div>");
                if (events[i]["cancelled"] === true) {
                    $(event_card).css({
                        "border-left": "10px solid #FF1744"
                    });
                    event_count = $("<div class='event-cancelled'>Cancelled</div>");
                }
                $(event_card).append(event_name);
                $(".events-container").append(event_card);
            }
        }
    }

    // Checks if a specific date has any events
    function check_events(day, month, year) {
        var events = [];
        for (var i = 0; i < event_data["events"].length; i++) {
            var event = event_data["events"][i];
            if (event["day"] === day &&
                event["month"] === month &&
                event["year"] === year) {
                events.push(event);
            }
        }
        return events;
    }

    // Given data for events in JSON format
    var event_data = {
        "events": [
            //2020
            {
                "occasion": " Dia da Conquista do Voto Feminino no Brasil ",
                "year": 2020,
                "month": 2,
                "day": 24,

            },
            {
                "occasion": " Dia Internacional da Mulher ",
                "year": 2020,
                "month": 3,
                "day": 8,

            },
            {
                "occasion": " Dia Marielle Franco de luta contra o genocídio da mulher negra ",
                "year": 2020,
                "month": 3,
                "day": 14,
            },
            {
                "occasion": " Dia Nacional da Mulher ",
                "year": 2020,
                "month": 4,
                "day": 30,

            },
            {
                "occasion": " Dia Internacional de Ação pela Saúde da Mulher ",
                "year": 2020,
                "month": 5,
                "day": 28,

            },
            {
                "occasion": " <a target=\"_blank\" class=\"link-calendar\" href=\"https://www.google.com/search?q=orgulho+lgbt\" > Dia do Orgulho LGBT+ </a> ",
                "year": 2020,
                "month": 6,
                "day": 28,
            },
            {
                "occasion": " Dia da Mulher Negra da América Latina e do Caribe ",
                "year": 2020,
                "month": 7,
                "day": 25,

            },
            {
                "occasion": " <a target=\"_blank\" class=\"link-calendar\" href=\"https://www.institutomariadapenha.org.br/lei-11340/resumo-da-lei-maria-da-penha.html\" > Dia da sanção da Lei Maria da Penha </a> ",
                "year": 2020,
                "month": 8,
                "day": 7,
            },
            {
                "occasion": " Dia Internacional da Mulher Indígena ",
                "year": 2020,
                "month": 9,
                "day": 5,
            },
            {
                "occasion": " Dia Nacional de Luta contra a Violência à Mulher ",
                "year": 2020,
                "month": 10,
                "day": 5,
            },
            
            {
                "occasion": " Dia Internacional pela Eliminação da Violência contra a Mulher ",
                "year": 2020,
                "month": 11,
                "day": 25,
            },
            {
                "occasion": " Dia Nacional de Mobilização dos Homens pelo Fim da Violência contra as Mulheres ",
                "year": 2020,
                "month": 12,
                "day": 6,
            },
            {
                "occasion": " Dia Internacional dos Direitos Humanos ",
                "year": 2020,
                "month": 12,
                "day": 10,
            },

            //2021
            {
                "occasion": " Dia da Conquista do Voto Feminino no Brasil ",
                "year": 2021,
                "month": 2,
                "day": 24,

            },
            {
                "occasion": " Dia Internacional da Mulher ",
                "year": 2021,
                "month": 3,
                "day": 8,

            },
            {
                "occasion": " Dia Marielle Franco de luta contra o genocídio da mulher negra ",
                "year": 2021,
                "month": 3,
                "day": 14,
            },
            {
                "occasion": " Dia Nacional da Mulher ",
                "year": 2021,
                "month": 4,
                "day": 30,

            },
            {
                "occasion": " Dia Internacional de Ação pela Saúde da Mulher ",
                "year": 2021,
                "month": 5,
                "day": 28,

            },
            {
                "occasion": " Dia da Mulher Negra da América Latina e do Caribe ",
                "year": 2021,
                "month": 7,
                "day": 25,

            },
            {
                "occasion": " Dia Nacional de Luta contra a Violência à Mulher ",
                "year": 2021,
                "month": 10,
                "day": 5,
            },
            {
                "occasion": " <a target=\"_blank\" class=\"link-calendar\" href=\"https://facesbr.com/webinar-ciclo-da-violencia/\" > Webinar – Ciclo da Violência </a> ",
                "year": 2021,
                "month": 5,
                "day": 27 ,
            },
            {
                "occasion": " <a target=\"_blank\" class=\"link-calendar\" href=\"https://ufmg.br/comunicacao/noticias/campanha-portodasbh-propoe-mapeamento-da-violencia-contra-a-mulher-na-capital-mineira\" > Inauguração: Campanha #PORTODASBH </a> ",
                "year": 2021,
                "month": 6,
                "day": 1,
            },
            {
                "occasion": " <a target=\"_blank\" class=\"link-calendar\" href=\"https://www.youtube.com/watch?v=rMigSHKnY-k\" > Inauguração: Performance \"Violência Contra a Mulher\" </a> ",
                "year": 2021,
                "month": 6,
                "day": 10,
            },
            {
                "occasion": " <a target=\"_blank\" class=\"link-calendar\" href=\"https://www.google.com/search?q=orgulho+lgbt\" > Dia do Orgulho LGBT+ </a> ",
                "year": 2021,
                "month": 6,
                "day": 28,
            },
            {
                "occasion": " <a target=\"_blank\" class=\"link-calendar\" href=\"https://www.institutomariadapenha.org.br/lei-11340/resumo-da-lei-maria-da-penha.html\" > Dia da sanção da Lei Maria da Penha </a> ",
                "year": 2021,
                "month": 8,
                "day": 7,
            },
            {
                "occasion": " Dia Internacional da Mulher Indígena ",
                "year": 2021,
                "month": 9,
                "day": 5,
            },
            {
                "occasion": " Dia Internacional pela Eliminação da Violência contra a Mulher ",
                "year": 2021,
                "month": 11,
                "day": 25,
            },
            {
                "occasion": " Dia Nacional de Mobilização dos Homens pelo Fim da Violência contra as Mulheres ",
                "year": 2021,
                "month": 12,
                "day": 6,
            },
            {
                "occasion": " Dia Internacional dos Direitos Humanos ",
                "year": 2021,
                "month": 12,
                "day": 10,
            },

            //2022
            {
                "occasion": " Dia da Conquista do Voto Feminino no Brasil ",
                "year": 2022,
                "month": 2,
                "day": 24,

            },
            {
                "occasion": " Dia Internacional da Mulher ",
                "year": 2022,
                "month": 3,
                "day": 8,

            },
            {
                "occasion": " Dia Marielle Franco de luta contra o genocídio da mulher negra ",
                "year": 2022,
                "month": 3,
                "day": 14,
            },
            {
                "occasion": " Dia Nacional da Mulher ",
                "year": 2022,
                "month": 4,
                "day": 30,

            },
            {
                "occasion": " Dia Internacional de Ação pela Saúde da Mulher ",
                "year": 2022,
                "month": 5,
                "day": 28,

            },
            {
                "occasion": " <a target=\"_blank\" class=\"link-calendar\" href=\"https://www.google.com/search?q=orgulho+lgbt\" > Dia do Orgulho LGBT+ </a> ",
                "year": 2022,
                "month": 6,
                "day": 28,
            },
            {
                "occasion": " Dia da Mulher Negra da América Latina e do Caribe ",
                "year": 2022,
                "month": 7,
                "day": 25,

            },
            {
                "occasion": " <a target=\"_blank\" class=\"link-calendar\" href=\"https://www.institutomariadapenha.org.br/lei-11340/resumo-da-lei-maria-da-penha.html\" > Dia da sanção da Lei Maria da Penha </a> ",
                "year": 2022,
                "month": 8,
                "day": 7,
            },
            {
                "occasion": " Dia Internacional da Mulher Indígena ",
                "year": 2022,
                "month": 9,
                "day": 5,
            },
            {
                "occasion": " Dia Nacional de Luta contra a Violência à Mulher ",
                "year": 2022,
                "month": 10,
                "day": 5,
            },
            
            {
                "occasion": " Dia Internacional pela Eliminação da Violência contra a Mulher ",
                "year": 2022,
                "month": 11,
                "day": 25,
            },
            {
                "occasion": " Dia Nacional de Mobilização dos Homens pelo Fim da Violência contra as Mulheres ",
                "year": 2022,
                "month": 12,
                "day": 6,
            },
            {
                "occasion": " Dia Internacional dos Direitos Humanos ",
                "year": 2022,
                "month": 12,
                "day": 10,
            },

            //2023
            {
                "occasion": " Dia da Conquista do Voto Feminino no Brasil ",
                "year": 2023,
                "month": 2,
                "day": 24,

            },
            {
                "occasion": " Dia Internacional da Mulher ",
                "year": 2023,
                "month": 3,
                "day": 8,

            },
            {
                "occasion": " Dia Marielle Franco de luta contra o genocídio da mulher negra ",
                "year": 2023,
                "month": 3,
                "day": 14,
            },
            {
                "occasion": " Dia Nacional da Mulher ",
                "year": 2023,
                "month": 4,
                "day": 30,

            },
            {
                "occasion": " Dia Internacional de Ação pela Saúde da Mulher ",
                "year": 2023,
                "month": 5,
                "day": 28,

            },
            {
                "occasion": " <a target=\"_blank\" class=\"link-calendar\" href=\"https://www.google.com/search?q=orgulho+lgbt\" > Dia do Orgulho LGBT+ </a> ",
                "year": 2023,
                "month": 6,
                "day": 28,
            },
            {
                "occasion": " Dia da Mulher Negra da América Latina e do Caribe ",
                "year": 2023,
                "month": 7,
                "day": 25,

            },
            {
                "occasion": " <a target=\"_blank\" class=\"link-calendar\" href=\"https://www.institutomariadapenha.org.br/lei-11340/resumo-da-lei-maria-da-penha.html\" > Dia da sanção da Lei Maria da Penha </a> ",
                "year": 2023,
                "month": 8,
                "day": 7,
            },
            {
                "occasion": " Dia Internacional da Mulher Indígena ",
                "year": 2023,
                "month": 9,
                "day": 5,
            },
            {
                "occasion": " Dia Nacional de Luta contra a Violência à Mulher ",
                "year": 2023,
                "month": 10,
                "day": 5,
            },
            
            {
                "occasion": " Dia Internacional pela Eliminação da Violência contra a Mulher ",
                "year": 2023,
                "month": 11,
                "day": 25,
            },
            {
                "occasion": " Dia Nacional de Mobilização dos Homens pelo Fim da Violência contra as Mulheres ",
                "year": 2023,
                "month": 12,
                "day": 6,
            },
            {
                "occasion": " Dia Internacional dos Direitos Humanos ",
                "year": 2023,
                "month": 12,
                "day": 10,
            }
            
        ]
    };

    const months = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];

})(jQuery);
