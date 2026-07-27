Feature: Create a new team

  Scenario: Create a team => Success

    Given as scrumMaster I am on the start page
    When as scrumMaster I create team TeamA estimating
    Then as scrumMaster I should see the game board for TeamA
    And as scrumMaster I should see myself as scrum master
    And as scrumMaster I can start a poker round
    And as scrumMaster I can take a break
    And as scrumMaster I can change the cardset
    And as scrumMaster I can dismiss TeamA

  Scenario: Create two teams => Success

    Given as scrumMaster I am on the start page
    And as observer I am on the start page
    When as scrumMaster I create team TeamA estimating
    And as observer I create team TeamB estimating
    Then as scrumMaster I should see the game board for TeamA
    And as observer I should see the game board for TeamB
    And as scrumMaster I can dismiss TeamA
    And as observer I can dismiss TeamB

  Scenario: Create an existing team => Failure
    Given the scrumMaster has created team TeamA estimating
    And as observer I am on the start page
    When as observer I create team TeamA estimating
    Then as scrumMaster I should see the game board for TeamA
    And as scrumMaster I can dismiss TeamA
    And as observer I should get an error message ErrorCode.Message.TeamAlreadyExists
