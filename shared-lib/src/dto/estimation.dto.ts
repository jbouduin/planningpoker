/**
 * The estimation Dto
 */
export interface EstimationDto {
  /**
   * The card index from the card.
   * This value is null when estimations are not to be revealed in the app
   * !This is not the index of the card in the array of cards. It is the field `index` of `ICard`
   */
  cardIndex: number | null;
  // revealed: boolean,
  /**
   * The participantId of the participant giving the estimation
   */
  participantId: string;
}
