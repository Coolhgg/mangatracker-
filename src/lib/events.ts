import { EventEmitter } from 'events';

// Simple global event bus for SSE mock
class GlobalBus extends EventEmitter {}

export const eventsBus = new GlobalBus();

export type CommentEvent = {
  type: 'comment.created' | 'comment.updated' | 'comment.deleted' | 'reaction.updated';
  payload: any;
};

export function emitCommentEvent(evt: CommentEvent) {
  eventsBus.emit('comments', evt);
}