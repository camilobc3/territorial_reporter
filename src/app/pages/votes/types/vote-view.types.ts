import { Annotation } from 'src/app/models/annotation';
import { Vote } from 'src/app/models/vote';

export interface VoteWithAnnotation {
  vote: Vote;
  annotation: Annotation | null;
}
