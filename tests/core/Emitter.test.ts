import { describe, it, expect, vi } from 'vitest';
import { createEmitter } from '../../src/core/Emitter';

describe('createEmitter', () => {
  it('calls handler when event is emitted', () => {
    const emitter = createEmitter();
    const handler = vi.fn();
    emitter.on('test', handler);
    emitter.emit('test', 'arg1', 'arg2');
    expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('calls multiple handlers for same event', () => {
    const emitter = createEmitter();
    const h1 = vi.fn();
    const h2 = vi.fn();
    emitter.on('test', h1);
    emitter.on('test', h2);
    emitter.emit('test');
    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();
  });

  it('does not call handler after off()', () => {
    const emitter = createEmitter();
    const handler = vi.fn();
    emitter.on('test', handler);
    emitter.off('test', handler);
    emitter.emit('test');
    expect(handler).not.toHaveBeenCalled();
  });

  it('emitting unknown event does not throw', () => {
    const emitter = createEmitter();
    expect(() => emitter.emit('unknown')).not.toThrow();
  });

  it('off() with unknown handler does not throw', () => {
    const emitter = createEmitter();
    expect(() => emitter.off('unknown', vi.fn())).not.toThrow();
  });
});
