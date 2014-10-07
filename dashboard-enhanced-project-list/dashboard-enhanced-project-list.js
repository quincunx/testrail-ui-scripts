name: Dashboard - Enhanced project list
description: See https://github.com/quincunx/testrail-ui-scripts
author: Christian Schuerer-Waldheim <csw@gmx.at>
version: 1.0
includes: ^dashboard
excludes: 

js:

var ProjectsList = [];
var TimestampNow = Date.now();

$(document).ready(
  function() {
    // Check if Compact View is being displayed
    if ($('span.content-header-icon:nth-child(1) > a:nth-child(1) > img:nth-child(1)').attr('src').indexOf("Inactive") == -1) {
      // Add and show a progress animation in the projects table header, will be hidden when sorted table is shown 
      $('#content-inner > h1.top').append(' <span style="display: inline;" id="projectsBusy"><img src="images/animations/progressInline.gif" alt="" height="9" width="16"></span>'); 
      DashboardGetProjectInfo();
    }
  }
);

// DashboardGetProjectInfo: Loop over every table row and gather information about milestones
function DashboardGetProjectInfo() {
  var GetProjectInfo = [];
  // Build array with promises
  $('#content-inner > table > tbody  > tr').each(function() { 
    var $project_table_row = $(this);
    var TestRailProjectID = $project_table_row.attr('id').match(/(\d+)/)[1];
    GetProjectInfo.push(MergeRowWithProjectInfo(TestRailProjectID, $project_table_row));
  });
  // Run all requests and wait for them to finish
  $.when.apply($, GetProjectInfo).done(SortProjectTable);
}

// SortProjectTable: Once all requests are finished, sort rows and replace table content
function SortProjectTable() {
  var ProjectTableRowsSorted = "";
  ProjectsList.sort(function(a, b) { return a.due_on - b.due_on; } );
  for (var index in ProjectsList) {
    var $ProjectRow = ProjectsList[index].tr;
    // Fix even/odd classes of table rows
    if (index % 2 == 0) { $ProjectRow.removeClass("even").addClass("odd"); } else { $ProjectRow.removeClass("odd").addClass("even"); } 
    ProjectTableRowsSorted = ProjectTableRowsSorted + $ProjectRow[0].outerHTML;
  }
  $('#content-inner > table > tbody').html(ProjectTableRowsSorted);
  // Stop progress animation
  $('#projectsBusy').css("display", "none");
}

// MergeRowWithProjectInfo: Query TestRail API for active milestones (asynchronous)
function MergeRowWithProjectInfo(ProjectID, $ProjectRow) {
  return $.ajax(
  {
    async: true,
    url: uiscripts.env.page_base + '/api/v2/get_milestones/' + ProjectID + '&is_completed=0',
    dataType: 'json',
    beforeSend: function(xhr)
    {
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("X-Requested-With", "API Client");
    },
    success: function(data, status)
    {
      // Set a virtual due date (unix timestamp) if milestone does not have one, otherwise sorting would be incorrect
      $.each(data, function(idx, obj) { if (obj.due_on == null) { obj.due_on = "9999999999"; }; } );
      // Sort milestones by due date
      data.sort(function(a, b) { return a.due_on - b.due_on; } );
      // If there are milestone, check if they are overdue. Only the first milestone is being checked.
      if (!jQuery.isEmptyObject(data)) { 
	if (data[0].due_on*1000 <= TimestampNow) { $ProjectRow.addClass("overdue"); }
	ProjectsList.push( { project_id:ProjectID, due_on:data[0].due_on, tr: $ProjectRow } ); 
      } else { 
	// In order to sort all projects later, we need a due date, even if the project does not have any milestones
	ProjectsList.push( { project_id:ProjectID, due_on:"99999999999", tr: $ProjectRow } ); 
      }
    },
    error: function(error)
    {
      // console.log(error);
    }
  });
}

css:
.overdue td:nth-child(2) > a:nth-child(1) {
  color: #ff0000;
  font-weight: bold;
}