Feature: Join a team

  Scenario: Join a team estimating => Success

    Given the scrumMaster has created team TeamA estimating
    And as observer I am on the start page
    When as observer I join team TeamA estimating
    Then as observer I should see the game board for TeamA
    And as observer I should see scrumMaster as scrum master
    And as scrumMaster I should see observer as developer
    And as observer I should see myself as developer
    And as observer I can take a break
    And as observer I can leave the team
    And as scrumMaster I can dismiss TeamA

  Scenario: Join a team observing => Success

    Given the scrumMaster has created team TeamA estimating
    And as observer I am on the start page
    When as observer I join team TeamA observing
    Then as observer I should see the game board for TeamA
    And as observer I should see scrumMaster as scrum master
    And as scrumMaster I should see observer as observer
    And as observer I should see myself as observer
    And as observer I can take a break
    And as observer I can leave the team
    And as scrumMaster I can dismiss TeamA

  Scenario: Join a team => Failure

    Given as observer I am on the start page
    When as observer I join team TeamA estimating
    Then as observer I should get an error message ErrorCode.Message.TeamNotFound

  Scenario: Return to start page should show a dialog
    Given the scrumMaster has created team TeamA estimating
    And the observer has joined team TeamA estimating
    When as observer I return to the start page
    Then as observer I should see a dialog with title MessageBox.Rejoin_$team_as_$nick.Title
    And as observer I should see a dialog with a submit button labeled Button.Generic.Label.Yes
    And as observer I should see a dialog with a cancel button labeled Button.Generic.Label.No
    And  as scrumMaster I can dismiss TeamA

  Scenario: Clicking yes should bring back to game
    Given the scrumMaster has created team TeamB estimating
    And the observer has joined team TeamB estimating
    And as observer I returned to the start page
    When as observer I rejoin my team
    Then as observer I should see the game board for TeamB
    And  as scrumMaster I can dismiss TeamB

  Scenario: Clicking no should stay on start
    Given the scrumMaster has created team TeamB estimating
    And the observer has joined team TeamB estimating
    And as observer I returned to the start page
    When as observer I do not rejoin my team
    Then as observer I should see the start page
    And  as scrumMaster I can dismiss TeamB
