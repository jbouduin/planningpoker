Feature: Create a new team

  Scenario: Create a team => Success

    Given I am on the start page as scrumMaster
    When I create team TeamA as scrumMaster
    Then as scrumMaster I should see the game board for TeamA
    And as scrumMaster I can start a poker round
    And as scrumMaster I can take a break
    And as scrumMaster I can change the cardset
    And as scrumMaster I can dismiss TeamA

  Scenario: Create two teams => Success

    Given I am on the start page as scrumMaster
    And I am on the start page as observer
    When I create team TeamA as scrumMaster
    When I create team TeamB as observer
    Then as scrumMaster I should see the game board for TeamA
    And as observer I should see the game board for TeamB
    And as scrumMaster I can dismiss TeamA
    And as observer I can dismiss TeamB

  Scenario: Create an existing team => Failure
    Given I am on the start page as scrumMaster
    And I am on the start page as observer
    When I create team TeamA as scrumMaster
    When I create team TeamA as observer
    Then as scrumMaster I should see the game board for TeamA
    And as scrumMaster I can dismiss TeamA
    And as observer I should get an error message ErrorCode.Message.TeamAlreadyExists
