import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import PriorityTag from '../index';

describe('PriorityTag', () => {
    it('applies the className based on the theme property `hashtag`', () => {
        const theme = { prioritytag: 'custom-class-name' };
        const result = shallow(<PriorityTag theme={theme} />);
        expect(result).to.have.prop('className', 'custom-class-name');
    });

    it('applies any custom passed prop', () => {
        const result = shallow(<PriorityTag data-custom="unicorn" />);
        expect(result).to.have.prop('data-custom', 'unicorn');
    });

    it('renders the passed in children', () => {
        const result = shallow(<PriorityTag children="#longRead" />);
        expect(result).to.have.prop('children', '#longRead');
    });

    it('applies a custom className as well as the theme', () => {
        const theme = { prioritytag: 'custom-class-name' };
        const result = shallow(<PriorityTag theme={theme} className="prioritytag" />);
        expect(result).to.have.prop('className').to.contain('prioritytag');
        expect(result).to.have.prop('className').to.contain('custom-class-name');
    });
});
