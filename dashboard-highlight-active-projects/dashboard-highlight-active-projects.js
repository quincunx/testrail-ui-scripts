name: Dashboard - Highlight active projects (Compact View only)
description: See https://github.com/quincunx/testrail-ui-scripts
author: Christian Schuerer-Waldheim <csw@gmx.at>
version: 1.0
includes: ^dashboard
excludes: 

js:
$(document).ready(
  function() {
    // Check if Compact View is being displayed
    if ($('span.content-header-icon:nth-child(1) > a:nth-child(1) > img:nth-child(1)').attr('src').indexOf("Inactive") == -1) {
      $('#content-inner > table > tbody  > tr').each(function() {
        var $project = $(this);
        var run_count = 0;
        $project.children('td:nth-child(3)').each(function() { run_count = $(this).children('strong:nth-child(3)').html(); });
        if (run_count > 0) { $project.addClass("project-active"); }
      });
    }
  }
);

css:
.project-active{
  background:#FFCC33
}