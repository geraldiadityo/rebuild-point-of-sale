interface TitleProps {
    title: string;
}

const TitleText = ({ title }: TitleProps) => {
    return (
        <h1 className="text-2xl font-bold text-gray-900 leading-none">
            {title}
        </h1>
    )
}

export default TitleText;
