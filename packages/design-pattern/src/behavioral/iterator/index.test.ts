import { describe, it, expect } from 'bun:test';
import { WordsCollection } from './index';

describe('Iterator Pattern', () => {
    it('should iterate through a collection', () => {
        const collection = new WordsCollection();
        collection.addItem('First');
        collection.addItem('Second');
        collection.addItem('Third');

        const iterator = collection.getIterator();
        const result: string[] = [];

        while (iterator.valid()) {
            result.push(iterator.next());
        }

        expect(result).toEqual(['First', 'Second', 'Third']);
    });

    it('should iterate through a collection in reverse', () => {
        const collection = new WordsCollection();
        collection.addItem('First');
        collection.addItem('Second');
        collection.addItem('Third');

        const iterator = collection.getReverseIterator();
        const result: string[] = [];

        while (iterator.valid()) {
            result.push(iterator.next());
        }

        expect(result).toEqual(['Third', 'Second', 'First']);
    });
});
