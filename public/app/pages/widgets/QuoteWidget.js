/**
 * QuoteWidget Component
 */
import React from 'react';  
import Session  from '../../middleware/Session'; 

export default class QuoteWidget extends React.Component {

  constructor(props) {
    super(props);

    if (Session.getSession('prg_lg') == null) {
      window.location.href = "/";
    }

    this.quotes = [{ text: 'the way to get started is to quit talking and begin doing', author: 'Walt Disney'},
      { text: 'winning starts with beginning', author: 'Unknown'},
      { text: 'dream big dreams. Small dreams have no magic.', author: 'Dottie Boreyko'},
      { text: 'there are seven days in the week and someday isn’t one of them.', author: 'unknown'},
      { text: 'i have not failed. i’ve just found 10,000 ways that won’t work.', author: 'Thomas Edison'},
      { text: 'most people quit because they look how far they have to go, not how far they have come.', author: 'Anyonymous'},
      { text: 'it always seems impossible until it’s done.', author: 'Nelson Mandela'},
      { text: 'the only person you are destined to become is the person you decide to be.', author: 'Ralph Waldo Emerson'},
      { text: 'if you are still looking for that one person who will change your life, take a look in the mirror.', author: 'Roman Price'},
      { text: 'things may come to those who wait, but only the things left by those who hustle.', author: 'Abraham Lincoln'},
      { text: 'the struggle you’re in today is developing the strength you need for tomorrow.', author: 'Unknown'},
      { text: 'whatever the mind can conceive and believe, the mind can achieve.', author: 'Napoleon Hill'},
      { text: 'you must be the change you wish to see in the world.', author: 'Gandhi'},
      { text: 'don’t let someone who gave up on their dreams talk you out of going after yours.', author: 'Zig Ziglar'}
    ];

    this.rotateValue = 0;

    let now = new Date();
    let start = new Date(now.getFullYear(), 0, 0);
    let oneDay = 1000 * 60 * 60 * 24;
    let day = Math.floor((now - start) / oneDay);
    let quote = this.quotes[day % this.quotes.length];

    let curQuote = this.getCurQuote();
    if (curQuote > -1) quote = this.quotes[curQuote % this.quotes.length];

    let session = Session.getSession('prg_lg');
    this.state = {
      user: session,
      quote: quote,
    };
  }

  componentDidMount() {
    $(".quote-holder").hover(
      function() {
        $(this).animate({ marginTop: '-40px' });
        $(".quote-author").fadeIn();
      }, function() { 
        $(this).animate({ marginTop: '-20px' });
        $(".quote-author").fadeOut();
      }
    );
  }

  getCurQuote() {
    let dt = new Date();
    let todayKey = dt.getMonth() + dt.getDate();

    let storedQuote = localStorage.getItem('quote');
    console.log("Stored: " + storedQuote);
    let storedQuoteKey = storedQuote && storedQuote.substring(0, storedQuote.indexOf(':'))

    if (storedQuoteKey && (storedQuoteKey == todayKey)) {
      return parseInt(storedQuote.substring(storedQuote.indexOf(":") + 1));
    } else {
      return -1;
    }
  }

  incrementDailyQuote() {
    let dt = new Date();
    let todayKey = dt.getMonth() + dt.getDate() + ':';
    let curQuote = this.getCurQuote();
    if (curQuote == null || curQuote == -1) { 
      let start = new Date(dt.getFullYear(), 0, 0);
      let oneDay = 1000 * 60 * 60 * 24;
      let day = Math.floor((dt - start) / oneDay);
      curQuote = day;
    }
    localStorage.setItem('quote', todayKey + (curQuote + 1));
    let quote = this.quotes[(curQuote + 1) % this.quotes.length];
    this.setState({quote: quote});
  }

  toggleQuote() {
    console.log("toggleQuote");
    this.rotateValue += 180;
    $(".fa-refresh").rotate({ animateTo:this.rotateValue});
    
    let that = this;
    setTimeout(function() { 
      $(".quote-holder").fadeOut(function() {
        that.incrementDailyQuote();
        $(".quote-holder").fadeIn(); 
      }); 
    }, 500);

  }



  render() { 
    var hidden = { display:"none" }


    return ( 
      <section className="quote-holder">
        <p className="quote-text">“ {this.state.quote.text} ”</p>
        <p className="quote-author" style={hidden}>{this.state.quote.author} <a onClick={this.toggleQuote.bind(this) }><i className='fa fa-refresh rotate'></i></a></p>
      </section>
    )
  } 
}