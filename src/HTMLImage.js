import React, { PureComponent } from 'react';
import { Image, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import Lightbox from 'react-native-lightbox';

export default class HTMLImage extends PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            width: props.imagesInitialDimensions.width,
            height: props.imagesInitialDimensions.height
        };
    }

    static propTypes = {
        source: PropTypes.object.isRequired,
        alt: PropTypes.string,
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        style: Image.propTypes.style,
        imagesMaxWidth: PropTypes.number,
        imagesInitialDimensions: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number
        })
    }

    static defaultProps = {
        imagesInitialDimensions: {
            width: 0,
            height: 0
        }
    }

    componentDidMount () {
        this.getImageSize();
        this.mounted = true;
    }

    componentDidUpdate(prevProps, prevState) {
        this.getImageSize(this.props);
    }

    getDimensionsFromStyle(style, height, width, maxWidth) {
        let styleWidth;
        let styleHeight;
        let styleMaxWidth;
    
        if (height) {
          styleHeight = height;
        }
        if (width) {
          styleWidth = width;
        }
        if (maxWidth) {
          styleMaxWidth = maxWidth;
        }
        if (Array.isArray(style)) {
          style.forEach(styles => {
            if (!width && styles['width']) {
              styleWidth = styles['width'];
            }
            if (!height && styles['height']) {
              styleHeight = styles['height'];
            }
            if (!maxWidth && styles['maxWidth']) {
              styleMaxWidth = styles['maxWidth'];
            }
          });
        } else {
          if (!width && style['width']) {
            styleWidth = style['width'];
          }
          if (!height && style['height']) {
            styleHeight = style['height'];
          }
          if (!maxWidth && style['maxWidth']) {
            styleMaxWidth = style['maxWidth'];
          }
        }
    
        return { styleWidth, styleHeight, styleMaxWidth };
      }
    
      getImageSize(props = this.props) {
        const { source, imagesMaxWidth, style, height, width } = props;
        const { styleWidth, styleHeight, styleMaxWidth } = this.getDimensionsFromStyle(
          style,
          height,
          width,
        );
        if (styleWidth && styleHeight) {
          return (
            this.mounted &&
            this.setState({
              width:
                typeof styleWidth === 'string' && styleWidth.search('%') !== -1
                  ? styleWidth
                  : parseInt(styleWidth, 10),
              height:
                typeof styleHeight === 'string' && styleHeight.search('%') !== -1
                  ? styleHeight
                  : parseInt(styleHeight, 10),
            })
          );
        }
        // Fetch image dimensions only if they aren't supplied or if with or height is missing
        Image.getSize(
          source.uri,
          (originalWidth, originalHeight) => {
            let optimalWidth;
            let optimalHeight;
            if (!styleMaxWidth && !imagesMaxWidth) {
              return this.mounted && this.setState({ width: originalWidth, height: originalHeight });
            }
            if (imagesMaxWidth) {
              console.log('2 :', imagesMaxWidth);
              optimalWidth = imagesMaxWidth <= originalWidth ? imagesMaxWidth : originalWidth;
              optimalHeight = (optimalWidth * originalHeight) / originalWidth;
            }
            if (styleMaxWidth) {
              console.log('1 :');
              optimalWidth = styleMaxWidth <= originalWidth ? styleMaxWidth : originalWidth;
              optimalHeight = (optimalWidth * originalHeight) / originalWidth;
            }
            this.mounted && this.setState({ width: optimalWidth, height: optimalHeight, error: false });
          },
          () => {
            this.mounted && this.setState({ error: true });
          },
        );
      }

    validImage (source, style, props = {}) {
        return (
            <Lightbox>
                <Image
                    source={source}
                    defaultSource={require('./assets/default.png')}
                    style={[style, { width: this.state.width, height: this.state.height, resizeMode: 'cover' }]}
                    {...props}
                />
            </Lightbox>
        );
    }

    get errorImage () {
        return (
            <Image
                source={require('./assets/error.png')}
            />
        );
    }

    render () {
        const { source, style, passProps } = this.props;

        return !this.state.error ? this.validImage(source, style, passProps) : this.errorImage;
    }
}
