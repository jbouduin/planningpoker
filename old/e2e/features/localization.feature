Feature: Change language

  Scenario Outline: change language on start screen
    Given as observer I am on the start page
    When as observer I change my language to <language>
    Then the start button for observer should be labeled <start>
    And the join button for observer should be labeled <join>

    Examples:
      | language | start   | join      |
      | en-US    | Start   | Join      |
      | de-DE    | Starten | Beitreten |
