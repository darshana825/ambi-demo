import React from 'react'
import Session  from '../../middleware/Session';
import NewsCategoryListItem from './NewsCategoryListItem'
export default class NewsCategoryList extends React.Component{

	constructor(props){
        super(props);
        let _sesData = Session.getSession('prg_lg');

		this.state = {
            selected : "" ,
            categories : "",
            status:false,
            loggedUser:_sesData,
            news_categories:[]
        };
		this.categoryIsSelected = this.categoryIsSelected.bind(this);
		this.selectedNewsCategories =[];
        this.unSelectedNewsCategories =[];
        this.loadNewsCategory();
	}

    loadNewsCategory(){
        $.ajax({
            url: '/news/get-categories',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
        }).done(function (data, text) {
            if (data.status.code == 200) {

                this.setState({news_categories:data.news})
            }
        }.bind(this));
    }

	categoryIsSelected(category,status){
        if(status){
            this.selectedNewsCategories.push(category)
            let index  = this.unSelectedNewsCategories.indexOf(category,1);
            this.unSelectedNewsCategories.splice(index);

        }else{
            this.unSelectedNewsCategories.push(category)
            let index = this.selectedNewsCategories.indexOf(category,1)
            this.selectedNewsCategories.splice(index);
        }
        this.props.onCategorySelect(this.selectedNewsCategories,this.unSelectedNewsCategories);
    }


	render() {
        const {news_categories} = this.state;
        let _this = this;

        let news_category_tmpl = news_categories.map(function(newsCategory,key){


            let _cat_bg_image   = "/images/news/pg-signup-" + newsCategory.category.toLocaleLowerCase() + ".png";
            let _cat_logo       = "/images/news/pg-signup-6-" + newsCategory.category.toLocaleLowerCase() + ".png";

            return(
                <NewsCategoryListItem catName={newsCategory.category}
                                      backgroundImgCode={_cat_bg_image}
                                      catImgLogo={_cat_logo}
                                      isSelected={_this.categoryIsSelected}
                                      catId={newsCategory._id}
                                      isFavorite={newsCategory.is_favorite}/>
            );
        });
        return (
			<div className="row row-clr pgs-news-read-cover">
            	<div className="row row-clr pgs-news-read-cover-inner">
                    {news_category_tmpl}
                </div>
            </div>
		);
	}
}

