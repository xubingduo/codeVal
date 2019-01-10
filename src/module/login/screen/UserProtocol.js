/**
 *@author xbu
 *@date 2018/09/14
 *@desc  用户协议
 *
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    ScrollView
} from 'react-native';
import I18n from '../../../gsresource/string/i18n';
import colors from '../../../gsresource/ui/colors';
import NavigationHeader from '/component/NavigationHeader';
import fonts from '../../../gsresource/ui/fonts';

export default class names extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'商陆好店用户注册协议'}
                    themeStyle={'default'}
                    statusBarStyle={'dark-content'}
                />
            ),
        };
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={{backgroundColor: colors.white}}>
                    <View style={{padding: 15}}>
                        <Text style={styles.textFonts}>
                            欢迎用户使用商陆好店服务（以下简称“服务”）。以下所述条款和条件即构成用户与杭州由她网络科技有限公司 （以下简称“服务提供方”或“杭州由她”）就服务所达成的协议。一旦用户使用了服务，即表示用户已接受了以下所述的条款和条件。如果用户不同意接受全部的条款和条件，那么用户将无权使用服务。当您完成注册并点击同意提交时，即表示您已同意受该协议的约束。服务提供方有权随时修改以下条款和条件，并只需告知用户。在服务提供方修改服务条款后，用户继续使用服务应被视作用户已接受了修改后的条款。除非得到服务提供方的书面授权，任何人将不得修改本协议。
                        </Text>
                        <Text style={styles.textFonts}>请注意，服务提供方督促用户仔细阅读相关条款。</Text>

                        <Text style={styles.title}>1.服务使用</Text>
                        <Text style={styles.textFonts}>1.1 本服务仅向能够根据相关法律订立具有法律约束力的合约的企业或自然人提供。因此，用户应确认本企业已取得真实、合法、有效的工商营业执照或本人已满十八周岁，且系完全民事行为能力人。</Text>
                        <Text style={styles.textFonts}>1.2 用户须同时凭用户名和密码登录服务，对于通过其他手段登录、使用所造成的后果，服务提供方将不承担任何责任。</Text>
                        <Text style={styles.textFonts}>1.3 服务提供方仅根据用户名和密码确认使用服务的用户身份。用户应妥善保管用户名和密码，并对其使用及其遗失自行承担责任。用户承诺，如其用户名和密码遭到未获授权的使用，或者发生其他任何安全问题时，将立即通知服务提供方。用户在此同意并确认，服务提供方对因上述情形产生的遗失或损害不负责任。</Text>
                        <Text style={styles.textFonts}>1.4 服务与服务提供方其他产品存在集成关系，如用户通过服务使用服务提供方的其他产品，则视为认同服务提供方其他产品的使用条款。</Text>


                        <Text style={styles.title}>2.服务功能</Text>
                        <Text style={styles.textFonts}>2.1本服务包含以下功能（该等功能随时可能因服务版本不同、或服务提供方的单方判断而被增加或修改，或因定期、不定期的维护而暂缓提供，用户将会得到相应的变更通知）：</Text>
                        <Text style={styles.smallText}>（a）可获取展示产品相关信息，包括但不限于外形、价格、库存等；</Text>
                        <Text style={styles.smallText}>（b）可直接进行展示商品的交易、支付；</Text>
                        <Text style={styles.smallText}>（c）可获得购买产品的物流等相关信息；</Text>
                        <Text style={styles.smallText}>（d）可与用户所拥有的笑铺日记系统数据共享，实时同步。</Text>

                        <Text style={styles.textFonts}>2.2 服务提供方保留在任何时候自行决定对服务及其版本、相关功能的变更、升级、修改、转移的权利。服务提供方进一步保留在服务中开发新的模块、功能或其它语种服务的权利。上述所有新的模块、功能、服务的提供，除非服务提供方有说明，否则仍适用本协议。</Text>
                        <Text style={styles.textFonts}>2.3用户同意仅为与第三方间进行商务沟通或与其他用户联络的目的而使用本服务，并同意自行承担由于使用本服务所获知信息而产生的全部商业风险。用户在此同意服务提供方在任何情况下都无需向用户或第三方在使用服务时对其在传输或联络中的迟延、不准确、错误或疏漏及因此而致使的损害负责。</Text>


                        <Text style={styles.title}>3.用户的权利和义务</Text>

                        <Text style={styles.textFonts}>3.1 用户保证向服务提供方提交的注册信息均真实、准确、及时、详尽和完整，并不断更新注册资料，以符合及时、详尽和准确的要求。</Text>
                        <Text style={styles.textFonts}>3.2 用户在使用服务过程中所涉信息不得含有任何违反国家法律、法规及中华人民共和国承认或加入的国际条约的内容，且用户通过服务所从事的一切活动都是合法、真实的，不侵犯任何第三方的合法权益。</Text>
                        <Text style={styles.textFonts}>3.3 用户保证其使用服务的各项行为均是基于真实、合法、有效的法律关系，均符合国家法律法规及本协议的规定。以下是服务提供方禁止用户进行的一些有害活动的示例，包括但不限于：</Text>
                        <Text style={styles.smallText}>（a）禁止出售、转售或复制、开发服务提供方授予的使用权限；</Text>
                        <Text style={styles.smallText}>（b）禁止基于商业目的模仿服务提供方的产品和服务；</Text>
                        <Text style={styles.smallText}>（c）禁止复制和模仿服务提供方的设计理念、界面、功能和图表；</Text>
                        <Text style={styles.smallText}>（d）禁止未经服务提供方许可基于此服务或其内容进行修改或制造派生其他产品；</Text>
                        <Text style={styles.textFonts}>用户只能处于用户商业范围内使用服务，禁止发送违反国家法律的信息，禁止发送和储存带有病毒的、蠕虫的、木马的和其他有害的计算机代码、文件、脚本和程序。</Text>

                        <Text style={styles.textFonts}>3.4 用户进一步同意对服务和/或服务任何部分（服务产品、页面标识、服务品牌、资讯、信息）不进行复制、翻译、修改、适应、增强、反编译、反汇编、反向工程、分解拆卸、出售、转租或作任何商业目的的使用。用户同意约束其有必要使用该服务的员工、代理、咨询者或顾问遵守前述之义务，并就其违反前述规定的行为对服务提供方就如同用户自身违反一样负责。</Text>
                        <Text style={styles.textFonts}>3.5 用户必须自行配备服务使用所需的设备，包括但不限于计算机、移动通信工具，并自行负担所需的相关费用。</Text>
                        <Text style={styles.textFonts}>3.6 用户应自行判断商业风险，并承诺通过服务进行的活动所引发的一切法律后果，由用户承担全部责任。如因用户使用服务的行为，导致服务提供方或任何第三方为此承担了相关的责任，则用户需全额赔偿服务提供方或任何第三方的相关支出及损失，包括合理的律师费用。</Text>
                        <Text style={styles.textFonts}>3.7 用户同意如因其违反本协议规定的任何条款或服务提供方不时发布的各项规则、通告。服务提供方有权单方判断立即终止用户使用服务，而无需事先通知用户。</Text>
                        <Text style={styles.textFonts}>3.8 用户同意在使用服务的同时，同意接受服务提供方提供的各类信息服务。</Text>

                        <Text style={styles.title}>4.服务提供方的权利和义务</Text>
                        <Text style={styles.textFonts}>4.1 服务提供方将按照本协议的规定向用户提供服务。</Text>
                        <Text style={styles.textFonts}>4.2 服务提供方有权在其服务器上复制并保存用户的信息。</Text>
                        <Text style={styles.textFonts}>4.3 服务提供方有权随时删除含有任何违反法律、法规、服务协议、各项规则的用户信息或链接，包括服务提供方对此有合理怀疑的信息。服务提供方有权单独对用户提供的信息是否属于上述范围做出判断。</Text>
                        <Text style={styles.textFonts}>4.4 服务提供方负责服务的维护与升级，并对该服务进行日常管理。</Text>
                        <Text style={styles.textFonts}>4.5 服务提供方负责用户数据订正，但仅限于因系统升级、系统迁移导致的用户数据错误。</Text>
                        <Text style={styles.textFonts}>4.6 服务提供方没有义务对用户使用服务的行为进行监督。但是，服务提供方保留权利在任何时候无需给予通知而终止用户使用服务。同时服务提供方有权在不经通知用户的情况下单方面将本协议项下的权利义务（包括但不限于服务登记、著作权等）转让给第三方。</Text>
                        <Text style={styles.textFonts}>4.7 上述保证将替代所有其它保证。在适用法律允许的最大范围内，特此替代所有其它保证、条件和声明，无论是明示的、默示的、口头的、法定的和其它方式，并且无论是依据本协议或其它协议而产生的。</Text>
                        <Text style={styles.textFonts}>4.8 服务提供方应在其网络系统内建立合理的安全体系，包括身份识别体系、内部安全防范体系，以使用户数据完整，并且保密。但用户了解并同意技术手段在不断更新，服务提供方无法杜绝全部的非安全因素，但服务提供方会及时更新安全体系，妥善维护网络及相关数据。</Text>
                        <Text style={styles.textFonts}>4.9 服务提供方将采取严格的保密措施存储用户信息，非经用户书面同意，不得向任何第三方泄露。以下信息除外：</Text>

                        <Text style={styles.smallText}>（a）非由于服务提供方的原因已经为公众所知的；</Text>
                        <Text style={styles.smallText}>（b）由于服务提供方以外其他渠道被他人获知的信息，这些渠道并不受保密义务的限制；</Text>
                        <Text style={styles.smallText}>（c） 由于法律的适用、法院或其他国家有权机关的要求而披露的信息。</Text>


                        <Text style={styles.title}>5.第三方服务说明</Text>
                        <Text style={styles.textFonts}>用户了解并确认服务中可能包含由第三方提供的服务，服务提供方仅是为了用户的便利而提供相应的配套功能模块，但是服务提供方并不控制第三方的服务内容，也不对其负责。用户如需使用该等服务，应与第三方服务提供方另行达成服务协议，支付相应费用并承担可能的风险。服务提供方对第三方提供的服务不提供任何形式的保证。</Text>

                        <Text style={styles.title}>6.知识产权</Text>
                        <Text style={styles.textFonts}>6.1 服务提供方拥有本协议所规定的服务产品的著作权、商标权、专利权、专利申请权、专有技术、商业秘密以及其他相关的知识产权，包括与该服务有关的各种文档资料。其它本协议中未经提及的权利亦由服务提供方保留。服务提供方有权在不经通知用户的情况下单方面将上述权利转让给第三方。</Text>
                        <Text style={styles.textFonts}>6.2 未经服务提供方事先书面同意，用户不得为任何营利性或非营利性的目的自行实施、利用、转让或许可任何第三方实施、利用、转让上述知识产权。</Text>


                        <Text style={styles.title}>7.终止条款</Text>
                        <Text style={styles.textFonts}>7.1 出现下列情况之一的，服务提供方有权在不事先通知的情况下，立即终止用户使用服务的权利，而无需承担任何责任，并有权不予退还剩余服务费（如有）：</Text>
                        <Text style={styles.smallText}>（a）用户服务使用期限届满或提前到期。用户服务使用期限届满后用户如需继续使用本协议约定之服务的，则用户需与服务提供方另行签署有关购买服务的标准订单，并由用户向服务提供方支付相应的费用。</Text>
                        <Text style={styles.smallText}>（b）用户违反本协议有关保证、同意、承诺条款的约定；b）用户违反本协议有关保证、同意、承诺条款的约定；</Text>
                        <Text style={styles.smallText}>（c）其他服务提供方依单方判断认为应该立即终止用户使用服务的情形。</Text>
                        <Text style={styles.textFonts}>7.2 协议期内，在用户被第三方多次投诉等合理情形下，为避免用户及服务提供方的损失，服务提供方有权以电子邮件或其他书面形式通知用户后解除本合同，本合同自通知到达用户处时终止。</Text>

                        <Text style={styles.title}>8.免责及责任的限制与排除</Text>
                        <Text style={styles.textFonts}>8.1 服务提供方不保证服务在操作上不会中断或没有错误，不保证其会纠正服务的所有缺陷，亦不保证服务能满足用户的所有要求。用户承担所有关于令人满意的质量、性能、准确性的风险。</Text>
                        <Text style={styles.textFonts}>8.2 在所适用的法律允许的范围内，服务提供方不做任何明示的或默示的声明，也不给予任何明示的或默示的保证或条件，包括但不限于：</Text>
                        <Text style={styles.smallText}>（a）关于适销性、特定用途适用性、准确性和无侵权行为的任何保证或条件；</Text>
                        <Text style={styles.smallText}>（b）在交易过程或行业惯例中产生的任何保证或条件；</Text>
                        <Text style={styles.smallText}>（c）在访问或使用服务时不受干扰、没有错误的任何保证或条件。</Text>


                        <Text style={styles.textFonts}>8.3 在任何情况下，服务提供方均不对源于、基于或因本协议或用户使用服务而导致的数据的丢失和/或任何损害赔偿负责，包括但不限于非直接的、间接的、特殊的、附带性的或惩罚性的损害赔偿或其他任何形式的损害赔偿，即使服务提供方已被告知此等损害赔偿的可能性。</Text>
                        <Text style={styles.textFonts}>8.4不论在何种情况下， 服务提供方不就通信系统或互联网的中断、迟延或无法运作、技术故障、计算机错误或病毒、信息损坏或丢失或其它在服务提供方合理控制范围之外的原因而产生的其他任何性质的破坏而向用户或任何第三方承担损害赔偿责任。</Text>
                        <Text style={styles.textFonts}>8.5 服务提供的与用户业务相关的信息，均是服务提供方为用户查询之方便而提供，服务提供方将尽量及时更新上述信息。但用户了解并同意上述信息因客观情况的调整而不断更新，服务提供方不能确保时时更新，因此上述信息仅供参考。因用户适用了上述信息而造成的任何损失，服务提供方不向用户或任何第三方承担损害赔偿责任。</Text>
                        <Text style={styles.textFonts}>8.6 双方承认本条款反映了双方就协商谈判达成的一致意见。双方均完全了解本条款的后果并进一步承认本条款的合理性。</Text>



                        <Text style={styles.title}>9.不可抗力</Text>
                        <Text style={styles.textFonts}>如果由于黑客攻击或政府管制或网络通讯瘫痪等对其发生和后果不能预见的事件，双方均确认此属不可抗力；双方应按照不可抗力对影响履行本协议的程度，协商决定是否解除本协议、免除履行本协议的部分义务，或者延期履行本协议</Text>

                        <Text style={styles.title}>10.法律及争议解决</Text>
                        <Text style={styles.textFonts}>10.1 本协议适用中华人民共和国法律。如遇本协议项下的某一特定事项缺乏明确法律规定，则应参照通用国际商业惯例和/或行业惯例。</Text>
                        <Text style={styles.textFonts}>10.2 因双方就本协议的签订、履行或解释等发生争议，双方应努力友好协商解决。如协商不成，任何一方均有权向服务提供方所在地人民法院起诉。</Text>


                        <Text style={styles.title}>11.协议的转让</Text>
                        <Text style={styles.textFonts}>除非事先取得服务提供方书面同意，用户不得将其在本协议项下的权利与义务转让给任何第三方。</Text>

                        <Text style={styles.title}>12.其他条款</Text>
                        <Text style={styles.textFonts}>12.1 本协议构成用户和服务提供方之间就使用服务的完整的协议，并取代双方就有关本协议所载任何事项于先前以口头及书面方式达成的共识。</Text>
                        <Text style={styles.textFonts}>12.2 如本协议的任何条款被视作无效或无法执行，则上述条款可被分离，其余部分则仍具有法律效力。</Text>
                        <Text style={styles.textFonts}>12.3 本协议的标题仅为方便阅读所设，非对条款的定义、限制、解释或描述其范围或界限。</Text>
                        <Text style={styles.textFonts}>12.4 服务提供方于用户过失或违约时放弃本协议规定的权利的，不得视为服务提供方对用户的其他或以后同类之过失或违约行为弃权。</Text>
                    </View>
                </ScrollView>

            </SafeAreaView>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    textFonts: {
        color: colors.normalFont,
        fontSize: fonts.font12,
        lineHeight: 18
    },

    title: {
        color: colors.normalFont,
        fontSize: fonts.font14,
        lineHeight: 18,
        fontWeight: '600',
        paddingTop: 10,
        paddingBottom: 10,
    },

    smallText: {
        color: colors.normalFont,
        fontSize: fonts.font10,
        lineHeight: 18,
        fontWeight: '600',
        paddingTop: 2,
        paddingBottom: 2,
    }

});