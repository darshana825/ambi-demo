import React from 'react'


export default class NewsCategoryListItem extends React.Component{
    constructor(props){
        super(props);
        this.state={selected : this.props.isFavorite};

        this.onCategorySelect = this.onCategorySelect.bind(this);
    }

    onCategorySelect(e){
        let isSelected = this.state.selected;

        if(isSelected){
            isSelected = false
        }else{
            isSelected = true
        }

        this.setState({selected: isSelected});
        this.props.isSelected(e.target.id, isSelected);
    }

    render() {
        let classes = "row row-clr pgs-news-read-box";
        console.log(this.props.isFavorite)
        return (
            <div className={(this.state.selected) ? classes + " current-check" : classes}>
                <img src={this.props.backgroundImgCode} alt="" className="img-responsive pgs-news-main-cover-img"/>
                <div className="pgs-news-read-select">
                    <input id={this.props.catId} type="checkbox" className="compaire-check" onClick={this.onCategorySelect}
                        checked={(this.state.selected)?true:false}/>
                    <label htmlFor={this.props.catId}></label>
                </div>
                <div className="pgs-news-read-box-content">
                    <img src={this.props.catImgLogo} alt="" className="img-responsive"/>
                    <p>{this.props.catName}</p>
                </div>
            </div>
        );
    }
}

