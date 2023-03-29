Feature: Join a team

  Scenario: Join a team => Success

    Given the scrumMaster has created team TeamA
    And I am on the start page as observer
    When I join team TeamA as observer
    Then as observer I should see the game board for TeamA
    And as observer I can take a break
    And as observer I can leave the team
    And as scrumMaster I can dismiss TeamA

  Scenario: Join a team => Failure

    Given I am on the start page as observer
    When I join team TeamA as observer
    Then as observer I should get an error message ErrorCode.Message.TeamNotFound
