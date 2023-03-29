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
