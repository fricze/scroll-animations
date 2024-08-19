import {
	AbsoluteFill,
	interpolate,
	Series,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {ProgressBar} from './ProgressBar';
import {CodeTransition} from './CodeTransition';
import {HighlightedCode} from 'codehike/code';
import {ThemeColors, ThemeProvider} from './calculate-metadata/theme';
import {useMemo, useRef} from 'react';
import {RefreshOnCodeChange} from './ReloadOnCodeChange';
import {verticalPadding} from './font';
import './scroller.css';

export type Props = {
	steps: HighlightedCode[] | null;
	themeColors: ThemeColors | null;
	codeWidth: number | null;
};

export const Main: React.FC<Props> = ({steps, themeColors, codeWidth}) => {
	if (!steps) {
		throw new Error('Steps are not defined');
	}

	const {durationInFrames} = useVideoConfig();
	const stepDuration = durationInFrames / steps.length;
	const transitionDuration = 30;

	if (!themeColors) {
		throw new Error('Theme colors are not defined');
	}

	const outerStyle: React.CSSProperties = useMemo(() => {
		return {
			backgroundColor: themeColors.background,
		};
	}, [themeColors]);

	const style: React.CSSProperties = useMemo(() => {
		return {
			padding: `${verticalPadding}px 0px`,
		};
	}, []);

	const frame = useCurrentFrame();
	const start = 220;
	const scroll = interpolate(
		frame,
		[start, start + 40, start + 80],
		[0, 1000, 0],
	);

	const scrollRef = useRef<HTMLDivElement>(null);
	scrollRef.current?.scroll(0, scroll);

	return (
		<ThemeProvider themeColors={themeColors}>
			<AbsoluteFill style={outerStyle}>
				<div
					style={{
						width: codeWidth || '100%',
						margin: 'auto',
						position: 'absolute',
						left: '40px',
					}}
				>
					<ProgressBar steps={steps} />
					<AbsoluteFill style={style}>
						<Series>
							{steps.map((step, index) => (
								<Series.Sequence
									key={index}
									layout="none"
									durationInFrames={stepDuration}
									name={step.meta}
								>
									<CodeTransition
										oldCode={steps[index - 1]}
										newCode={step}
										durationInFrames={transitionDuration}
									/>
								</Series.Sequence>
							))}
						</Series>
					</AbsoluteFill>
				</div>

				<div ref={scrollRef} style={{}} className="scroller-parent">
					{Array(15)
						.fill(0)
						.map(() => (
							<div className="scroller" />
						))}
				</div>
			</AbsoluteFill>
			<RefreshOnCodeChange />
		</ThemeProvider>
	);
};
