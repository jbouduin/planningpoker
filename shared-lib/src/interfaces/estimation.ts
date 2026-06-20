/**
 * The estimation Dto
 */
export interface IEstimation {
  /**
   * The card index from the card.
   * If undefined it means that the participant has not given an estimation (yet)
   * !This is not the index of the card in the array of cards
   */
  cardIndex: number | undefined;
  // revealed: boolean,
  /**
   * The participantId of the participant giving the estimation
   */
  participantId: string;
}
